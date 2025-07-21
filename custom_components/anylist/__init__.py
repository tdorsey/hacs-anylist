import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .client import AnylistClient
from .const import DOMAIN
from .server import AnylistServer, start_server
from .services import register_services

PLATFORMS: list[Platform] = [Platform.TODO]

_LOGGER = logging.getLogger(DOMAIN)


async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Set up AnyList from a config entry."""
    anylist_client = AnylistClient(config_entry)
    hass.data[DOMAIN] = anylist_client

    # Register services
    register_services(hass, anylist_client)

    # Start server if configured
    server = start_server(hass, config_entry)
    if server:
        anylist_client.binary_server = server
        _LOGGER.info("Server binary successfully started")

    await hass.config_entries.async_forward_entry_setups(config_entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Unload AnyList config entry."""
    client = hass.data[DOMAIN]
    if isinstance(client.binary_server, AnylistServer):
        client.binary_server.stop()

    if unload_ok := await hass.config_entries.async_unload_platforms(
        config_entry, PLATFORMS
    ):
        hass.data.pop(DOMAIN)

    return unload_ok
