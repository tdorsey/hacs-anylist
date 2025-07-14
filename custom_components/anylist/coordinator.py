import datetime
import logging

from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import DOMAIN

_LOGGER = logging.getLogger(DOMAIN)


class AnylistUpdateCoordinator(DataUpdateCoordinator):
    """Define an object to manage fetching AnyList data."""

    def __init__(self, hass, config_entry, list_name, refresh_interval):
        """Initialize the AnyList data coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            config_entry=config_entry,
            name=f"Anylist {list_name}",
            update_interval=datetime.timedelta(minutes=refresh_interval),
        )
        self.list_name = list_name
        self.hass = hass

    async def _async_update_data(self):
        """Fetch data from AnyList."""
        code, items = await self.hass.data[DOMAIN].get_detailed_items(self.list_name)
        return items
