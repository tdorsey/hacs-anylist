"""Tests for the anylist services module."""

import pytest
from unittest.mock import AsyncMock, Mock

from custom_components.anylist.services import (
    create_service_handlers,
    register_services,
    SERVICE_ADD_ITEM,
    SERVICE_REMOVE_ITEM,
    SERVICE_CHECK_ITEM,
    SERVICE_UNCHECK_ITEM,
    SERVICE_GET_ITEMS,
    SERVICE_GET_ALL_ITEMS,
)
from custom_components.anylist.const import ATTR_NAME, ATTR_LIST


@pytest.fixture
def mock_anylist_client():
    """Create a mock AnylistClient."""
    client = Mock()
    client.add_item = AsyncMock(return_value=200)
    client.remove_item_by_name = AsyncMock(return_value=200)
    client.check_item = AsyncMock(return_value=200)
    client.get_items = AsyncMock(return_value=(200, ["item1", "item2"]))
    client.get_all_items = AsyncMock(return_value=(200, (["item1"], ["item2"])))
    return client


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    hass = Mock()
    hass.services = Mock()
    return hass


@pytest.fixture
def mock_service_call():
    """Create a mock service call."""
    call = Mock()
    call.data = {
        ATTR_NAME: "test item",
        ATTR_LIST: "Shopping",
    }
    return call


class TestServiceHandlers:
    """Test the service handler functions."""

    @pytest.mark.asyncio
    async def test_add_item_service(self, mock_anylist_client, mock_service_call):
        """Test add_item_service handler."""
        handlers = create_service_handlers(mock_anylist_client)
        
        result = await handlers[SERVICE_ADD_ITEM](mock_service_call)
        
        assert result == {"code": 200}
        mock_anylist_client.add_item.assert_called_once_with(
            "test item", 
            updates=mock_service_call.data, 
            list_name="Shopping"
        )

    @pytest.mark.asyncio
    async def test_remove_item_service(self, mock_anylist_client, mock_service_call):
        """Test remove_item_service handler."""
        handlers = create_service_handlers(mock_anylist_client)
        
        result = await handlers[SERVICE_REMOVE_ITEM](mock_service_call)
        
        assert result == {"code": 200}
        mock_anylist_client.remove_item_by_name.assert_called_once_with(
            "test item",
            "Shopping"
        )

    @pytest.mark.asyncio
    async def test_check_item_service(self, mock_anylist_client, mock_service_call):
        """Test check_item_service handler."""
        handlers = create_service_handlers(mock_anylist_client)
        
        result = await handlers[SERVICE_CHECK_ITEM](mock_service_call)
        
        assert result == {"code": 200}
        mock_anylist_client.check_item.assert_called_once_with(
            "test item",
            "Shopping",
            True
        )

    @pytest.mark.asyncio
    async def test_uncheck_item_service(self, mock_anylist_client, mock_service_call):
        """Test uncheck_item_service handler."""
        handlers = create_service_handlers(mock_anylist_client)
        
        result = await handlers[SERVICE_UNCHECK_ITEM](mock_service_call)
        
        assert result == {"code": 200}
        mock_anylist_client.check_item.assert_called_once_with(
            "test item",
            "Shopping",
            False
        )

    @pytest.mark.asyncio
    async def test_get_items_service(self, mock_anylist_client, mock_service_call):
        """Test get_items_service handler."""
        handlers = create_service_handlers(mock_anylist_client)
        
        result = await handlers[SERVICE_GET_ITEMS](mock_service_call)
        
        assert result == {"code": 200, "items": ["item1", "item2"]}
        mock_anylist_client.get_items.assert_called_once_with("Shopping")

    @pytest.mark.asyncio
    async def test_get_all_items_service(self, mock_anylist_client, mock_service_call):
        """Test get_all_items_service handler."""
        handlers = create_service_handlers(mock_anylist_client)
        
        result = await handlers[SERVICE_GET_ALL_ITEMS](mock_service_call)
        
        expected = {
            "code": 200,
            "uncheckedItems": ["item1"],
            "checkedItems": ["item2"],
        }
        assert result == expected
        mock_anylist_client.get_all_items.assert_called_once_with("Shopping")

    @pytest.mark.asyncio
    async def test_service_call_without_list(self, mock_anylist_client):
        """Test service call without list parameter."""
        call = Mock()
        call.data = {ATTR_NAME: "test item"}
        
        # Mock get method to return None for ATTR_LIST
        def mock_get(key, default=None):
            if key == ATTR_LIST:
                return None
            return call.data.get(key, default)
        
        call.data = Mock()
        call.data.__getitem__ = Mock(side_effect=lambda key: "test item" if key == ATTR_NAME else None)
        call.data.get = Mock(side_effect=mock_get)
        
        handlers = create_service_handlers(mock_anylist_client)
        
        await handlers[SERVICE_ADD_ITEM](call)
        
        mock_anylist_client.add_item.assert_called_once_with(
            "test item",
            updates=call.data,
            list_name=None
        )


class TestRegisterServices:
    """Test the register_services function."""

    def test_register_services(self, mock_hass, mock_anylist_client):
        """Test that all services are registered correctly."""
        register_services(mock_hass, mock_anylist_client)
        
        # Verify that async_register was called for each service
        assert mock_hass.services.async_register.call_count == 6
        
        # Verify the service names that were registered
        registered_services = [
            call[0][1] for call in mock_hass.services.async_register.call_args_list
        ]
        
        expected_services = [
            SERVICE_ADD_ITEM,
            SERVICE_REMOVE_ITEM,
            SERVICE_CHECK_ITEM,
            SERVICE_UNCHECK_ITEM,
            SERVICE_GET_ITEMS,
            SERVICE_GET_ALL_ITEMS,
        ]
        
        for service in expected_services:
            assert service in registered_services