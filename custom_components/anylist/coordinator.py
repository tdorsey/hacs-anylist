"""Define an object to manage fetching AnyList data."""

from __future__ import annotations

from abc import abstractmethod
from dataclasses import dataclass
from datetime import timedelta
from typing import Generic, TypeVar

from aioAnyList import (
    AnyListAuthenticationError,
    AnyListClient,
    AnyListConnectionError,
    Mealplan,
    MealplanEntryType,
    Recipe,
    ShoppingItem,
    ShoppingList,
    Statistics,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .const import LOGGER

_DataT = TypeVar("_DataT")

WEEK = timedelta(days=7)


@dataclass
class AnyListData:
    """AnyList data type."""

    client: AnyListClient
    mealplan_coordinator: "AnyListMealplanCoordinator"
    shoppinglist_coordinator: "AnyListShoppingListCoordinator"
    statistics_coordinator: "AnyListStatisticsCoordinator"
    recipe_coordinator: "AnyListRecipeCoordinator"


@dataclass
class ShoppingListData:
    """Data class for shopping list data."""

    shopping_list: ShoppingList
    items: list[ShoppingItem]


class AnyListDataUpdateCoordinator(DataUpdateCoordinator[_DataT], Generic[_DataT]):
    """Base coordinator."""

    config_entry: ConfigEntry
    _name: str
    _update_interval: timedelta

    def __init__(
        self,
        hass: HomeAssistant,
        config_entry: ConfigEntry,
        client: AnyListClient,
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
            return await self._async_update_internal()
        except AnyListAuthenticationError as err:
            raise ConfigEntryAuthFailed from err
        except AnyListConnectionError as err:
            raise UpdateFailed(f"Error communicating with API: {err}") from err

    @abstractmethod
    async def _async_update_internal(self) -> _DataT:
        """Fetch data from AnyList (to be implemented by subclasses)."""
        pass


class AnyListMealplanCoordinator(
    AnyListDataUpdateCoordinator[dict[MealplanEntryType, list[Mealplan]]]
):
    """Class to manage fetching AnyList mealplan data."""

    _name = "mealplan"
    _update_interval = timedelta(hours=1)

    async def _async_update_internal(self) -> dict[MealplanEntryType, list[Mealplan]]:
        """Fetch mealplan data from AnyList."""
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


class AnyListShoppingListCoordinator(
    AnyListDataUpdateCoordinator[dict[str, ShoppingListData]]
):
    """Class to manage fetching AnyList shopping list data."""

    _name = "shopping_list"
    _update_interval = timedelta(minutes=5)

    async def _async_update_internal(self) -> dict[str, ShoppingListData]:
        """Fetch shopping list data from AnyList."""
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
    """Class to manage fetching AnyList statistics data."""

    _name = "statistics"
    _update_interval = timedelta(minutes=15)

    async def _async_update_internal(self) -> Statistics:
        """Fetch statistics data from AnyList."""
        return await self.client.get_statistics()


class AnyListRecipeCoordinator(AnyListDataUpdateCoordinator[dict[str, list[Recipe]]]):
    """Class to manage fetching AnyList recipe data."""

    _name = "recipe"
    _update_interval = timedelta(minutes=10)

    async def _async_update_internal(self) -> dict[str, list[Recipe]]:
        """Fetch recipe data from AnyList."""
        return await self.client.get_recipes()
