"""AnyList server management functionality."""

import logging
import os
import stat
import subprocess
from threading import Thread
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

from .const import CONF_EMAIL, CONF_PASSWORD, CONF_SERVER_BINARY, DOMAIN

BINARY_SERVER_PORT = "28597"

_LOGGER = logging.getLogger(DOMAIN)


class AnylistServer(Thread):
    """AnyList binary server management."""

    def __init__(self, args: list[str]) -> None:
        """Initialize the AnyList server."""
        super().__init__(name=DOMAIN, daemon=True)
        self.args = args
        self.process: subprocess.Popen[bytes] | None = None

    @property
    def available(self) -> bool:
        """Check if the server process is available."""
        return self.process.poll() is None if self.process else False

    def run(self) -> None:
        """Run the server process."""
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
            _LOGGER.error("Binary server exited with error code: %s", code)

        self.process = None

    def stop(self, *args: Any) -> None:
        """Stop the server process."""
        if self.process is not None:
            self.process.terminate()


def start_server(
    hass: HomeAssistant, config_entry: ConfigEntry
) -> AnylistServer | None:
    """Start the AnyList binary server if configured."""
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
