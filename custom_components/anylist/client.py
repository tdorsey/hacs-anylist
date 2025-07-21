"""AnyList API client functionality."""

import logging
from typing import Any

import aiohttp
from homeassistant.config_entries import ConfigEntry
from homeassistant.exceptions import HomeAssistantError

from .const import (
    ATTR_CHECKED,
    ATTR_ID,
    ATTR_LIST,
    ATTR_NAME,
    ATTR_NOTES,
    CONF_DEFAULT_LIST,
    CONF_SERVER_ADDR,
    DOMAIN,
)
from .server import BINARY_SERVER_PORT, AnylistServer

_LOGGER = logging.getLogger(DOMAIN)


class AnylistClient:
    """AnyList API client for communication with the AnyList service."""

    def __init__(self, config_entry: ConfigEntry) -> None:
        """Initialize the AnyList client."""
        self.config_entry = config_entry
        self.binary_server: AnylistServer | None = None

    def populate_item_updates(
        self, item: dict[str, Any], updates: dict[str, Any] | None
    ) -> None:
        """Populate item dictionary with updates."""
        if updates is None:
            return

        if ATTR_NAME in updates:
            item[ATTR_NAME] = updates[ATTR_NAME].strip()

        if ATTR_CHECKED in updates:
            item[ATTR_CHECKED] = updates[ATTR_CHECKED]

        if ATTR_NOTES in updates:
            item[ATTR_NOTES] = updates[ATTR_NOTES]

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        json_data: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> tuple[int, dict[str, Any] | None]:
        """Make an HTTP request to the AnyList API."""
        url = self.get_server_url(endpoint)

        async with aiohttp.ClientSession() as session:
            if method.upper() == "GET":
                async with session.get(url, params=params) as response:
                    status = response.status
                    data = await response.json() if status == 200 else None
                    return status, data
            elif method.upper() == "POST":
                async with session.post(url, json=json_data) as response:
                    status = response.status
                    data = await response.json() if status == 200 else None
                    return status, data
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

    async def add_item(
        self,
        item_name: str,
        updates: dict[str, Any] | None = None,
        list_name: str | None = None,
    ) -> int:
        """Add an item to the AnyList."""
        body = {ATTR_NAME: item_name.strip(), ATTR_LIST: self.get_list_name(list_name)}

        self.populate_item_updates(body, updates)
        body[ATTR_CHECKED] = "False"

        status, _ = await self._make_request("POST", "add", json_data=body)
        if status not in (200, 304):
            _LOGGER.error("Failed to add item. Received error code %d.", status)
        return status

    async def remove_item_by_name(
        self, item_name: str, list_name: str | None = None
    ) -> int:
        """Remove an item by name from the AnyList."""
        body = {ATTR_NAME: item_name.strip(), ATTR_LIST: self.get_list_name(list_name)}

        status, _ = await self._make_request("POST", "remove", json_data=body)
        if status not in (200, 304):
            _LOGGER.error("Failed to remove item. Received error code %d.", status)
        return status

    async def remove_item_by_id(
        self, item_id: str, list_name: str | None = None
    ) -> int:
        """Remove an item by ID from the AnyList."""
        body = {ATTR_ID: item_id, ATTR_LIST: self.get_list_name(list_name)}

        status, _ = await self._make_request("POST", "remove", json_data=body)
        if status not in (200, 304):
            _LOGGER.error("Failed to remove item. Received error code %d.", status)
        return status

    async def update_item(
        self, item_id: str, updates: dict[str, Any], list_name: str | None = None
    ) -> int:
        """Update an item in the AnyList."""
        body = {ATTR_ID: item_id, ATTR_LIST: self.get_list_name(list_name)}

        self.populate_item_updates(body, updates)

        status, _ = await self._make_request("POST", "update", json_data=body)
        if status != 200:
            _LOGGER.error("Failed to update item. Received error code %d.", status)
        return status

    async def check_item(
        self, item_name: str, list_name: str | None = None, checked: bool = True
    ) -> int:
        """Check or uncheck an item in the AnyList."""
        body = {
            ATTR_NAME: item_name.strip(),
            ATTR_LIST: self.get_list_name(list_name),
            ATTR_CHECKED: checked,
        }

        status, _ = await self._make_request("POST", "check", json_data=body)
        if status not in (200, 304):
            _LOGGER.error(
                "Failed to update item status. Received error code %d.", status
            )
        return status

    async def get_detailed_items(
        self, list_name: str | None = None
    ) -> tuple[int, list[dict[str, Any]]]:
        """Get detailed items from the AnyList."""
        params = (
            {ATTR_LIST: self.get_list_name(list_name)}
            if self.get_list_name(list_name)
            else None
        )

        status, data = await self._make_request("GET", "items", params=params)
        if status == 200 and data:
            return status, data.get("items", [])
        else:
            if status != 200:
                _LOGGER.error("Failed to get items. Received error code %d.", status)
            return status, []

    async def get_items(self, list_name: str | None = None) -> tuple[int, list[str]]:
        """Get unchecked items from the AnyList."""
        code, items = await self.get_detailed_items(list_name)
        if code == 200:
            filtered_items = [item for item in items if not item[ATTR_CHECKED]]
            item_names = [item[ATTR_NAME] for item in filtered_items]
            return code, item_names
        else:
            return code, []

    async def get_all_items(
        self, list_name: str | None = None
    ) -> tuple[int, tuple[list[str], list[str]]]:
        """Get all items (checked and unchecked) from the AnyList."""
        code, items = await self.get_detailed_items(list_name)
        if code == 200:
            unchecked_items = [
                item[ATTR_NAME] for item in items if not item[ATTR_CHECKED]
            ]
            checked_items = [item[ATTR_NAME] for item in items if item[ATTR_CHECKED]]
            return code, (unchecked_items, checked_items)
        else:
            return code, ([], [])

    async def get_lists(self) -> tuple[int, list[dict[str, Any]]]:
        """Get all lists from the AnyList."""
        status, data = await self._make_request("GET", "lists")
        if status == 200 and data:
            return status, data.get("lists", [])
        else:
            if status != 200:
                _LOGGER.error("Failed to get lists. Received error code %d.", status)
            return status, []

    def get_server_address(self) -> str:
        """Get the server address for API calls."""
        addr = self.config_entry.data.get(CONF_SERVER_ADDR)
        if addr is not None:
            return addr

        if self.binary_server is not None and self.binary_server.available:
            return f"http://127.0.0.1:{BINARY_SERVER_PORT}"

        raise HomeAssistantError("Binary server is not running")

    def get_server_url(self, endpoint: str) -> str:
        """Build the complete URL for an API endpoint."""
        addr = self.get_server_address()
        return f"{addr}/{endpoint}"

    def get_list_name(self, list_name: str | None) -> str:
        """Get the list name, using default if none provided."""
        return list_name or self.config_entry.options.get(CONF_DEFAULT_LIST, "")
