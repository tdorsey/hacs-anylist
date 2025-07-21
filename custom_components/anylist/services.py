"""AnyList service handlers and registration."""

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)

from .client import AnylistClient
from .const import ATTR_LIST, ATTR_NAME, ATTR_NOTES, DOMAIN

# Service names
SERVICE_ADD_ITEM = "add_item"
SERVICE_REMOVE_ITEM = "remove_item"
SERVICE_CHECK_ITEM = "check_item"
SERVICE_UNCHECK_ITEM = "uncheck_item"
SERVICE_GET_ITEMS = "get_items"
SERVICE_GET_ALL_ITEMS = "get_all_items"

# Service schemas
SERVICE_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_NAME): cv.string,
        vol.Optional(ATTR_NOTES, default=""): cv.string,
        vol.Optional(ATTR_LIST, default=""): cv.string,
    }
)

SERVICE_LIST_SCHEMA = vol.Schema({vol.Optional(ATTR_LIST, default=""): cv.string})


def create_service_handlers(anylist_client: AnylistClient):
    """Create service handler functions for the AnyList client."""

    async def add_item_service(call: ServiceCall) -> dict[str, int]:
        """Handle add item service call."""
        item_name = call.data[ATTR_NAME]
        list_name = call.data.get(ATTR_LIST)
        code = await anylist_client.add_item(
            item_name, updates=call.data, list_name=list_name
        )
        return {"code": code}

    async def remove_item_service(call: ServiceCall) -> dict[str, int]:
        """Handle remove item service call."""
        item_name = call.data[ATTR_NAME]
        list_name = call.data.get(ATTR_LIST)
        code = await anylist_client.remove_item_by_name(item_name, list_name)
        return {"code": code}

    async def check_item_service(call: ServiceCall) -> dict[str, int]:
        """Handle check item service call."""
        item_name = call.data[ATTR_NAME]
        list_name = call.data.get(ATTR_LIST)
        code = await anylist_client.check_item(item_name, list_name, True)
        return {"code": code}

    async def uncheck_item_service(call: ServiceCall) -> dict[str, int]:
        """Handle uncheck item service call."""
        item_name = call.data[ATTR_NAME]
        list_name = call.data.get(ATTR_LIST)
        code = await anylist_client.check_item(item_name, list_name, False)
        return {"code": code}

    async def get_items_service(call: ServiceCall) -> ServiceResponse:
        """Handle get items service call."""
        list_name = call.data.get(ATTR_LIST)
        (code, items) = await anylist_client.get_items(list_name)
        return {"code": code, "items": items}

    async def get_all_items_service(call: ServiceCall) -> ServiceResponse:
        """Handle get all items service call."""
        list_name = call.data.get(ATTR_LIST)
        (code, (unchecked_items, checked_items)) = await anylist_client.get_all_items(
            list_name
        )
        return {
            "code": code,
            "uncheckedItems": unchecked_items,
            "checkedItems": checked_items,
        }

    return {
        SERVICE_ADD_ITEM: add_item_service,
        SERVICE_REMOVE_ITEM: remove_item_service,
        SERVICE_CHECK_ITEM: check_item_service,
        SERVICE_UNCHECK_ITEM: uncheck_item_service,
        SERVICE_GET_ITEMS: get_items_service,
        SERVICE_GET_ALL_ITEMS: get_all_items_service,
    }


def register_services(hass: HomeAssistant, anylist_client: AnylistClient) -> None:
    """Register all AnyList services with Home Assistant."""
    service_handlers = create_service_handlers(anylist_client)

    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_ITEM,
        service_handlers[SERVICE_ADD_ITEM],
        schema=SERVICE_ITEM_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_REMOVE_ITEM,
        service_handlers[SERVICE_REMOVE_ITEM],
        schema=SERVICE_ITEM_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_CHECK_ITEM,
        service_handlers[SERVICE_CHECK_ITEM],
        schema=SERVICE_ITEM_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_UNCHECK_ITEM,
        service_handlers[SERVICE_UNCHECK_ITEM],
        schema=SERVICE_ITEM_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_ITEMS,
        service_handlers[SERVICE_GET_ITEMS],
        schema=SERVICE_LIST_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_ALL_ITEMS,
        service_handlers[SERVICE_GET_ALL_ITEMS],
        schema=SERVICE_LIST_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )
