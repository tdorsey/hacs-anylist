import logging
import os
import stat
import subprocess
from threading import Thread
from typing import Any, Optional

import aiohttp
import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STOP, Platform
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)
from homeassistant.exceptions import HomeAssistantError

from .const import (
    ATTR_CHECKED,
    ATTR_ID,
    ATTR_LIST,
    ATTR_NAME,
    ATTR_NOTES,
    CONF_DEFAULT_LIST,
    CONF_EMAIL,
    CONF_PASSWORD,
    CONF_SERVER_ADDR,
    CONF_SERVER_BINARY,
    DOMAIN,
)

PLATFORMS: list[Platform] = [Platform.TODO]

_LOGGER = logging.getLogger(DOMAIN)

SERVICE_ADD_ITEM = "add_item"
SERVICE_REMOVE_ITEM = "remove_item"
SERVICE_CHECK_ITEM = "check_item"
SERVICE_UNCHECK_ITEM = "uncheck_item"
SERVICE_GET_ITEMS = "get_items"
SERVICE_GET_ALL_ITEMS = "get_all_items"

BINARY_SERVER_PORT = "28597"

SERVICE_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_NAME): cv.string,
        vol.Optional(ATTR_NOTES, default=""): cv.string,
        vol.Optional(ATTR_LIST, default=""): cv.string,
    }
)

SERVICE_LIST_SCHEMA = vol.Schema({vol.Optional(ATTR_LIST, default=""): cv.string})


def start_server(
    hass: HomeAssistant, config_entry: ConfigEntry
) -> "AnylistServer | None":
    binary = config_entry.data.get(CONF_SERVER_BINARY)
    email = config_entry.data.get(CONF_EMAIL)
    password = config_entry.data.get(CONF_PASSWORD)

    if binary is None or email is None or password is None:
        return None

    if not os.path.isfile(binary):
        raise HomeAssistantError("Failed to locate server binary")

    if not os.access(binary, os.X_OK):
        _LOGGER.debug("Fixing server binary permissions")
        os.chmod(binary, os.stat(binary).st_mode | stat.S_IEXEC)

    if not os.access(binary, os.X_OK):
        raise HomeAssistantError("Failed to fix server binary permissions")

    credentials_file = hass.config.path(".anylist_credentials")
    server = AnylistServer(
        [
            binary,
            "--port",
            BINARY_SERVER_PORT,
            "--email",
            email,
            "--password",
            password,
            "--credentials-file",
            credentials_file,
            "--ip-filter",
            "127.0.0.1",
        ]
    )
    server.start()

    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, server.stop)
    return server


async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    anylist = hass.data[DOMAIN] = Anylist(config_entry)

    async def add_item_service(call: ServiceCall) -> dict[str, int]:
        item_name = call.data[ATTR_NAME]
        list_name = call.data.get(ATTR_LIST)
        code = await anylist.add_item(item_name, updates=call.data, list_name=list_name)
        return {"code": code}

    async def remove_item_service(call: ServiceCall) -> dict[str, int]:
        item_name = call.data[ATTR_NAME]
        list_name = call.data.get(ATTR_LIST)
        code = await anylist.remove_item_by_name(item_name, list_name)
        return {"code": code}

    async def check_item_service(call: ServiceCall) -> dict[str, int]:
        item_name = call.data[ATTR_NAME]
        list_name = call.data.get(ATTR_LIST)
        code = await anylist.check_item(item_name, list_name, True)
        return {"code": code}

    async def uncheck_item_service(call: ServiceCall) -> dict[str, int]:
        item_name = call.data[ATTR_NAME]
        list_name = call.data.get(ATTR_LIST)
        code = await anylist.check_item(item_name, list_name, False)
        return {"code": code}

    async def get_items_service(call: ServiceCall) -> ServiceResponse:
        list_name = call.data.get(ATTR_LIST)
        (code, items) = await anylist.get_items(list_name)
        return {"code": code, "items": items}

    async def get_all_items_service(call: ServiceCall) -> ServiceResponse:
        list_name = call.data.get(ATTR_LIST)
        (code, (unchecked_items, checked_items)) = await anylist.get_all_items(
            list_name
        )
        return {
            "code": code,
            "uncheckedItems": unchecked_items,
            "checkedItems": checked_items,
        }

    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_ITEM,
        add_item_service,
        schema=SERVICE_ITEM_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_REMOVE_ITEM,
        remove_item_service,
        schema=SERVICE_ITEM_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_CHECK_ITEM,
        check_item_service,
        schema=SERVICE_ITEM_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_UNCHECK_ITEM,
        uncheck_item_service,
        schema=SERVICE_ITEM_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_ITEMS,
        get_items_service,
        schema=SERVICE_LIST_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_ALL_ITEMS,
        get_all_items_service,
        schema=SERVICE_LIST_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )

    server = start_server(hass, config_entry)
    if server:
        anylist.binary_server = server
        _LOGGER.info("Server binary successfully started")

    await hass.config_entries.async_forward_entry_setups(config_entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    server = hass.data[DOMAIN].binary_server
    if isinstance(server, AnylistServer):
        server.stop()

    if unload_ok := await hass.config_entries.async_unload_platforms(
        config_entry, PLATFORMS
    ):
        hass.data.pop(DOMAIN)

    return unload_ok


class Anylist:

    binary_server: Optional["AnylistServer"] = None

    def __init__(self, config_entry: ConfigEntry) -> None:
        self.config_entry = config_entry

    def populate_item_updates(
        self, item: dict[str, Any], updates: dict[str, Any] | None
    ) -> None:
        if updates is None:
            return

        if ATTR_NAME in updates:
            item[ATTR_NAME] = updates[ATTR_NAME].strip()

        if ATTR_CHECKED in updates:
            item[ATTR_CHECKED] = updates[ATTR_CHECKED]

        if ATTR_NOTES in updates:
            item[ATTR_NOTES] = updates[ATTR_NOTES]

    async def add_item(
        self,
        item_name: str,
        updates: dict[str, Any] | None = None,
        list_name: str | None = None,
    ) -> int:
        body = {ATTR_NAME: item_name.strip(), ATTR_LIST: self.get_list_name(list_name)}

        self.populate_item_updates(body, updates)
        body[ATTR_CHECKED] = "False"

        async with aiohttp.ClientSession() as session:
            async with session.post(self.get_server_url("add"), json=body) as response:
                code = response.status
                if code != 200 and code != 304:
                    _LOGGER.error("Failed to add item. Received error code %d.", code)
                return code

    async def remove_item_by_name(
        self, item_name: str, list_name: str | None = None
    ) -> int:
        body = {ATTR_NAME: item_name.strip(), ATTR_LIST: self.get_list_name(list_name)}

        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.get_server_url("remove"), json=body
            ) as response:
                code = response.status
                if code != 200 and code != 304:
                    _LOGGER.error(
                        "Failed to remove item. Received error code %d.", code
                    )
                return code

    async def remove_item_by_id(
        self, item_id: str, list_name: str | None = None
    ) -> int:
        body = {ATTR_ID: item_id, ATTR_LIST: self.get_list_name(list_name)}

        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.get_server_url("remove"), json=body
            ) as response:
                code = response.status
                if code != 200 and code != 304:
                    _LOGGER.error(
                        "Failed to remove item. Received error code %d.", code
                    )
                return code

    async def update_item(
        self, item_id: str, updates: dict[str, Any], list_name: str | None = None
    ) -> int:
        body = {ATTR_ID: item_id, ATTR_LIST: self.get_list_name(list_name)}

        self.populate_item_updates(body, updates)

        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.get_server_url("update"), json=body
            ) as response:
                code = response.status
                if code != 200:
                    _LOGGER.error(
                        "Failed to update item. Received error code %d.", code
                    )
                return code

    async def check_item(
        self, item_name: str, list_name: str | None = None, checked: bool = True
    ) -> int:
        body = {
            ATTR_NAME: item_name.strip(),
            ATTR_LIST: self.get_list_name(list_name),
            ATTR_CHECKED: checked,
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.get_server_url("check"), json=body
            ) as response:
                code = response.status
                if code != 200 and code != 304:
                    _LOGGER.error(
                        "Failed to update item status. Received error code %d.", code
                    )
                return code

    async def get_detailed_items(
        self, list_name: str | None = None
    ) -> tuple[int, list[dict[str, Any]]]:
        if name := self.get_list_name(list_name):
            query = {ATTR_LIST: name}
        else:
            query = None

        async with aiohttp.ClientSession() as session:
            async with session.get(
                self.get_server_url("items"), params=query
            ) as response:
                code = response.status
                if code == 200:
                    body = await response.json()
                    return (code, body["items"] or [])
                else:
                    _LOGGER.error("Failed to get items. Received error code %d.", code)
                    return (code, [])

    async def get_items(self, list_name: str | None = None) -> tuple[int, list[str]]:
        code, items = await self.get_detailed_items(list_name)
        if code == 200:
            filtered_items = list(filter(lambda item: not item[ATTR_CHECKED], items))
            item_names = list(map(lambda item: item[ATTR_NAME], filtered_items))
            return (code, item_names)
        else:
            return (code, [])

    async def get_all_items(
        self, list_name: str | None = None
    ) -> tuple[int, tuple[list[str], list[str]]]:
        code, items = await self.get_detailed_items(list_name)
        if code == 200:
            unchecked_items_filtered = list(
                filter(lambda item: not item[ATTR_CHECKED], items)
            )
            unchecked_items = list(
                map(lambda item: item[ATTR_NAME], unchecked_items_filtered)
            )

            checked_items_filtered = list(
                filter(lambda item: item[ATTR_CHECKED], items)
            )
            checked_items = list(
                map(lambda item: item[ATTR_NAME], checked_items_filtered)
            )

            return (code, (unchecked_items, checked_items))
        else:
            return (code, ([], []))

    async def get_lists(self) -> tuple[int, list[dict[str, Any]]]:
        async with aiohttp.ClientSession() as session:
            async with session.get(self.get_server_url("lists")) as response:
                code = response.status
                if code == 200:
                    body = await response.json()
                    return (code, body["lists"] or [])
                else:
                    _LOGGER.error("Failed to get lists. Received error code %d.", code)
                    return (code, [])

    def get_server_address(self) -> str:
        addr = self.config_entry.data.get(CONF_SERVER_ADDR)
        if addr is not None:
            return addr

        if self.binary_server is not None and self.binary_server.available:
            return "http://127.0.0.1:{}".format(BINARY_SERVER_PORT)

        raise HomeAssistantError("Binary server is not running")

    def get_server_url(self, endpoint: str) -> str:
        addr = self.get_server_address()
        return "{}/{}".format(addr, endpoint)

    def get_list_name(self, list_name: str | None) -> str:
        return list_name or self.config_entry.options.get(CONF_DEFAULT_LIST, "")


class AnylistServer(Thread):

    def __init__(self, args: list[str]) -> None:
        super().__init__(name=DOMAIN, daemon=True)
        self.args = args
        self.process: subprocess.Popen[bytes] | None = None

    @property
    def available(self) -> bool:
        return self.process.poll() is None if self.process else False

    def run(self) -> None:
        self.process = subprocess.Popen(
            self.args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT
        )

        while self.process.poll() is None:
            if self.process.stdout is not None:
                line = self.process.stdout.readline()
                if line == b"":
                    break
                _LOGGER.info(line[:-1].decode())

        code = self.process.poll()
        if code is not None and code > 0:
            _LOGGER.error("Binary server exited with error code: {}".format(code))

        self.process = None

    def stop(self, *args: Any) -> None:
        if self.process is not None:
            self.process.terminate()
