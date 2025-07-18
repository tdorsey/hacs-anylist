from __future__ import annotations

from datetime import timedelta
from typing import Any

from homeassistant.components.todo import (
    TodoItem,
    TodoItemStatus,
    TodoListEntity,
    TodoListEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)

from .const import (
    ATTR_CHECKED,
    ATTR_ID,
    ATTR_NAME,
    ATTR_NOTES,
    CONF_REFRESH_INTERVAL,
    DOMAIN,
)
from .coordinator import AnyListDataUpdateCoordinator


class AnyListUpdateCoordinator(DataUpdateCoordinator[list[dict[str, Any]]]):
    """Update coordinator for AnyList todo items."""

    def __init__(
        self,
        hass: HomeAssistant,
        config_entry: ConfigEntry,
        list_name: str,
        refresh_interval: int,
    ) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            logger=__import__("logging").getLogger(__name__),
            name=f"anylist_{list_name}",
            update_interval=timedelta(seconds=refresh_interval),
        )
        self.list_name = list_name
        self.config_entry = config_entry

    async def _async_update_data(self) -> list[dict[str, Any]]:
        """Fetch data from AnyList."""
        code, items = await self.hass.data[DOMAIN].get_items(self.list_name)
        if code == 200:
            return items
        return []


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    refresh_interval = config_entry.options.get(CONF_REFRESH_INTERVAL, 30)

    code, lists = await hass.data[DOMAIN].get_lists()
    for list_name in lists:
        coordinator = AnyListUpdateCoordinator(
            hass, config_entry, list_name, refresh_interval
        )
        await coordinator.async_config_entry_first_refresh()

        async_add_entities([AnylistTodoListEntity(hass, coordinator, list_name)])


class AnylistTodoListEntity(
    CoordinatorEntity[AnyListUpdateCoordinator], TodoListEntity
):

    _attr_has_entity_name = True
    _attr_supported_features = (
        TodoListEntityFeature.CREATE_TODO_ITEM
        | TodoListEntityFeature.DELETE_TODO_ITEM
        | TodoListEntityFeature.UPDATE_TODO_ITEM
        | TodoListEntityFeature.SET_DESCRIPTION_ON_ITEM
    )

    def __init__(
        self,
        hass: HomeAssistant,
        coordinator: AnyListUpdateCoordinator,
        list_name: str,
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"anylist_{list_name}"
        self._attr_name = list_name
        self.list_name = list_name
        self.hass = hass

    @property
    def todo_items(self) -> list[TodoItem] | None:
        if self.coordinator.data is None:
            return None

        items = [
            TodoItem(
                summary=item[ATTR_NAME],
                uid=item[ATTR_ID],
                status=(
                    TodoItemStatus.COMPLETED
                    if item[ATTR_CHECKED]
                    else TodoItemStatus.NEEDS_ACTION
                ),
                description=item[ATTR_NOTES],
            )
            for item in self.coordinator.data
        ]
        return items

    async def async_create_todo_item(self, item: TodoItem) -> None:
        updates = self.get_item_updates(item)
        await self.hass.data[DOMAIN].add_item(
            item.summary, updates=updates, list_name=self.list_name
        )
        await self.coordinator.async_refresh()

    async def async_delete_todo_items(self, uids: list[str]) -> None:
        for uid in uids:
            await self.hass.data[DOMAIN].remove_item_by_id(
                uid, list_name=self.list_name
            )
        await self.coordinator.async_refresh()

    async def async_update_todo_item(self, item: TodoItem) -> None:
        updates = self.get_item_updates(item)
        await self.hass.data[DOMAIN].update_item(
            item.uid, updates=updates, list_name=self.list_name
        )
        await self.coordinator.async_refresh()

    def get_item_updates(self, item: TodoItem) -> dict[str, Any]:
        updates = dict()
        updates[ATTR_NAME] = item.summary or ""
        updates[ATTR_NOTES] = item.description or ""

        if item.status is not None:
            updates[ATTR_CHECKED] = item.status == TodoItemStatus.COMPLETED

        return updates

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "source_name": f"{self.list_name}",
            "checked_items": [
                item[ATTR_NAME] for item in self.coordinator.data if item[ATTR_CHECKED]
            ],
            "unchecked_items": [
                item[ATTR_NAME]
                for item in self.coordinator.data
                if not item[ATTR_CHECKED]
            ],
        }
