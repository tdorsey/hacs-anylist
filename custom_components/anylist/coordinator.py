import logging
import os
import stat

"""
This module defines the coordinator for the Anylist integration.

It includes schemas and helper functions to manage data updates and
interactions with the Anylist service.
"""

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

from .const import DOMAIN, CONF_DEFAULT_LIST, CONF_EMAIL, CONF_PASSWORD, CONF_REFRESH_INTERVAL, CONF_SERVER_ADDR, CONF_SERVER_BINARY
    CONF_DEFAULT_LIST,
    CONF_EMAIL,
    CONF_PASSWORD,
    CONF_REFRESH_INTERVAL,
    CONF_SERVER_ADDR,
    CONF_SERVER_BINARY,
)
shopping_lists = (await self.client.get_shopping_lists()).items
for shopping_list in shopping_lists:
        shopping_list_id = shopping_list.list_id
    
        shopping_items = (
            await self.client.get_shopping_items(shopping_list_id)
        ).items
    
        shopping_list_items[shopping_list_id] = ShoppingListData(
            shopping_list=shopping_list, items=shopping_items
        )
    return shopping_list_items
    
    
    class AnyListStatisticsCoordinator(AnyListDataUpdateCoordinator[Statistics]):
        """Class to manage fetching AnyList Statistics data."""
    
        _name = "statistics"
        _update_interval = timedelta(minutes=15)
    
        async def _async_update_internal(self) -> Statistics:
            """Fetch the latest statistics data from AnyList."""
            return await self.client.get_statistics()
    
    
    class AnyListRecipeCoordinator(AnyListDataUpdateCoordinator):
        """Class to manage fetching AnyList Recipe data."""
    
        _name = "recipes"
        _update_interval = timedelta(minutes=30)
    
        async def _async_update_internal(self):
    )           return await self.client.get_recipes()
    DOMAIN,
)

_LOGGER = logging.getLogger(DOMAIN)

STEP_ADDON_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_SERVER_ADDR): TextSelector(
            TextSelectorConfig(type=TextSelectorType.URL, autocomplete="url")
        )
    }
)

STEP_BINARY_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_SERVER_BINARY): TextSelector(
            TextSelectorConfig(type=TextSelectorType.TEXT)
        ),
        vol.Required(CONF_EMAIL): TextSelector(
            TextSelectorConfig(
                type=TextSelectorType.EMAIL, autocomplete="email"
            )
        ),
        vol.Required(CONF_PASSWORD): TextSelector(
            TextSelectorConfig(
                type=TextSelectorType.PASSWORD, autocomplete="current-password"
            )
        ),
    }
)

<<<<<<< HEAD
    async def _async_update_data(self):
        code, items = await self.hass.data[DOMAIN].get_detailed_items(self.list_name)
        return items
"""Define an object to manage fetching AnyList data."""

from __future__ import annotations

from abc import abstractmethod
from dataclasses import dataclass
from datetime import timedelta

from aioAnyList import (
    AnyListAuthenticationError,
    AnyListClient,
    AnyListConnectionError,
    Mealplan,
    MealplanEntryType,
    ShoppingItem,
    ShoppingList,
    Statistics,
)

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .const import DOMAIN, LOGGER

WEEK = timedelta(days=7)


@dataclass
class AnyListData:
    """AnyList data type."""

    client: AnyListClient
    mealplan_coordinator: AnyListMealplanCoordinator
    shoppinglist_coordinator: AnyListShoppingListCoordinator
    statistics_coordinator: AnyListStatisticsCoordinator
    recipe_coordinator: AnyListRecipeCoordinator


type AnyListConfigEntry = ConfigEntry[AnyListData]


class AnyListDataUpdateCoordinator[_DataT](DataUpdateCoordinator[_DataT]):
    """Base coordinator."""

    config_entry: AnyListConfigEntry
    _name: str
    _update_interval: timedelta

    def __init__(
        self, hass: HomeAssistant, config_entry: AnyListConfigEntry, client: AnyListClient
    ) -> None:
        """Initialize the AnyList data coordinator."""
        super().__init__(
            hass,
            LOGGER,
            config_entry=config_entry,
            name=f"AnyList {self._name}",
            update_interval=self._update_interval,
        )
        self.client = client

    async def _async_update_data(self) -> _DataT:
        """Fetch data from AnyList."""
        try:
            return await self._async_update_internal()            from aiohttp import ClientSession
            from .exceptions import AnyListAuthenticationError, AnyListConnectionError
            
            class AnyListClient:
                def __init__(self, base_url: str, api_key: str):
                    self.base_url = base_url
                    self.api_key = api_key
                    self.session = ClientSession()
                    self.headers = {
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    }                    
            
                async def get_recipes(self) -> dict[str, list[Recipe]]:
        """Fetch recipes from AnyList."""
        url = f"{self.base_url}/recipes"

        try:
            async with self.session.get(url, headers=self.headers) as response:
                if response.status == 401:
                    raise AnyListAuthenticationError("Invalid API key or token.")
                elif response.status != 200:
                    raise AnyListConnectionError(f"Failed to fetch recipes: {response.status}")

                data = await response.json()
                # Parse the response into the expected format
                return self._parse_recipes(data)

        except Exception as error:
            raise AnyListConnectionError(f"Error fetching recipes: {error}") from error
  from aiohttp import ClientSession
                from .exceptions import AnyListAuthenticationError, AnyListConnectionError



class AnyListMealplanCoordinator(
    AnyListDataUpdateCoordinator[dict[MealplanEntryType, list[Mealplan]]]
):
    """Class to manage fetching AnyList data."""

    _name = "mealplan"
    _update_interval = timedelta(hours=1)

    async def _async_update_internal(self) -> dict[MealplanEntryType, list[Mealplan]]:
        next_week = dt_util.now() + WEEK
        current_date = dt_util.now().date()
        next_week_date = next_week.date()
        response = await self.client.get_mealplans(current_date, next_week_date)
        res: dict[MealplanEntryType, list[Mealplan]] = {
            type_: [] for type_ in MealplanEntryType
        }
        for meal in response.items:
            res[meal.entry_type].append(meal)
        return res


@dataclass
class ShoppingListData:
    """Data class for shopping list data."""

    shopping_list: ShoppingList
    items: list[ShoppingItem]


class AnyListShoppingListCoordinator(
    AnyListDataUpdateCoordinator[dict[str, ShoppingListData]]
):
    """Class to manage fetching AnyList Shopping list data."""

    _name = "shopping_list"
    _update_interval = timedelta(minutes=5)

    async def _async_update_internal(
        self,
    ) -> dict[str, ShoppingListData]:
        shopping_list_items = {}
        shopping_lists = (await self.client.get_shopping_lists()).items
        for shopping_list in shopping_lists:
            shopping_list_id = shopping_list.list_id

            shopping_items = (
                await self.client.get_shopping_items(shopping_list_id)
            ).items

            shopping_list_items[shopping_list_id] = ShoppingListData(
                shopping_list=shopping_list, items=shopping_items
            )
        return shopping_list_items


class AnyListStatisticsCoordinator(AnyListDataUpdateCoordinator[Statistics]):
    """Class to manage fetching AnyList Statistics data."""

    _name = "statistics"
    _update_interval = timedelta(minutes=15)

    async def _async_update_internal(
        self,
    ) -> Statistics:
        return await self.client.get_statistics()


class AnyListRecipeCoordinator(
    AnyListDataUpdateCoordinator[dict[str, list[Recipe]]]
):
    """Class to manage fetching AnyList recipe data."""

    _name = "recipe"
    _update_interval = timedelta(minutes=10)
    async def _async_update_internal(self) -> dict[str, list[Recipe]]:
        """Fetch recipe data from AnyList."""
        return await self.client.get_recipes()
=======
STEP_INIT_DATA_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_DEFAULT_LIST, default=""): TextSelector(
            TextSelectorConfig(type=TextSelectorType.TEXT)
        ),
        vol.Optional(
            CONF_REFRESH_INTERVAL,
            default=30,
        ): NumberSelector(
            NumberSelectorConfig(
                min=15,
                max=120,
                step=15,
                unit_of_measurement="minutes",
                mode=NumberSelectorMode.SLIDER,
            )
        ),
    }
)


class ConfigFlow(config_entries.ConfigFlow):

    VERSION = 1

    async def async_step_user(self, user_input):
        return self.async_show_menu(
            step_id="user",
            menu_options={
                "addon": "Addon Server (Recommended)",
                "binary": "Binary Server (Experimental)",
            },
        )

    async def async_step_reconfigure(self, user_input):
        return self.async_show_menu(
            step_id="reconfigure",
            menu_options={
                "addon": "Addon Server (Recommended)",
                "binary": "Binary Server (Experimental)",
            },
        )

    async def async_step_addon(self, user_input):
        errors = {}
        if user_input is not None:
            url = user_input[CONF_SERVER_ADDR]
            if not await self.verify_addon_server(url):
                errors[CONF_SERVER_ADDR] = "addon_server_cannot_connect"

            if not errors:
                if self.source == config_entries.SOURCE_RECONFIGURE:
                    return self.async_update_reload_and_abort(
                        entry=self._get_reconfigure_entry(), data=user_input
                    )
                else:
                    return self.async_create_entry(
                        title="Anylist", data=user_input
                    )

        return self.async_show_form(
            step_id="addon", data_schema=STEP_ADDON_DATA_SCHEMA, errors=errors
        )

    async def verify_addon_server(self, url):
        try:
            r = await async_get_clientsession(self.hass).head(
                url, timeout=2, allow_redirects=False
            )
            return r.status < 500
        except Exception:
            return False

    async def async_step_binary(self, user_input):
        errors = {}
        if user_input is not None:
            path = user_input[CONF_SERVER_BINARY]
            error = self.verify_server_binary(path)
            if error is not None:
                errors[CONF_SERVER_BINARY] = error

            if not errors:
                if self.source == config_entries.SOURCE_RECONFIGURE:
                    return self.async_update_reload_and_abort(
                        entry=self._get_reconfigure_entry(), data=user_input
                    )
                else:
                    return self.async_create_entry(
                        title="Anylist",
                        data=user_input,
                    )

        return self.async_show_form(
            step_id="binary",
            data_schema=STEP_BINARY_DATA_SCHEMA,
            errors=errors,
        )

    def verify_server_binary(self, path):
        if not os.path.isfile(path):
            return "server_binary_not_found"

        if not os.access(path, os.X_OK):
            os.chmod(path, os.stat(path).st_mode | stat.S_IEXEC)

        if not os.access(path, os.X_OK):
            return "server_binary_wrong_permissions"

        return None

    def async_get_options_flow(self, _config_entry): 
        return OptionsFlow()


class OptionsFlow(config_entries.OptionsFlow):

    async def async_step_init(self, user_input):
        if user_input is not None:
            return self.async_create_entry(data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(
                STEP_INIT_DATA_SCHEMA, self.config_entry.options
            ),
        )
>>>>>>> 43ef543 (wip)
