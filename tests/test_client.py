"""Tests for the anylist client module."""

import pytest
from unittest.mock import AsyncMock, Mock, patch
from aiohttp import ClientResponse
from aiohttp.web import Response

from custom_components.anylist.client import AnylistClient
from custom_components.anylist.const import ATTR_CHECKED, ATTR_NAME, ATTR_LIST


@pytest.fixture
def mock_config_entry():
    """Create a mock config entry."""
    config_entry = Mock()
    config_entry.data = {
        "server_addr": "http://localhost:8080",
    }
    config_entry.options = {"default_list": "Shopping"}
    return config_entry


@pytest.fixture
def anylist_client(mock_config_entry):
    """Create an AnylistClient instance."""
    return AnylistClient(mock_config_entry)


class TestAnylistClient:
    """Test the AnylistClient class."""

    def test_client_initialization(self, mock_config_entry):
        """Test client initialization."""
        client = AnylistClient(mock_config_entry)
        assert client.config_entry == mock_config_entry
        assert client.binary_server is None

    def test_get_list_name_with_provided_name(self, anylist_client):
        """Test get_list_name with provided name."""
        result = anylist_client.get_list_name("Custom List")
        assert result == "Custom List"

    def test_get_list_name_with_default(self, anylist_client):
        """Test get_list_name falls back to default."""
        result = anylist_client.get_list_name(None)
        assert result == "Shopping"

    def test_get_server_address_from_config(self, anylist_client):
        """Test get_server_address from config."""
        result = anylist_client.get_server_address()
        assert result == "http://localhost:8080"

    def test_get_server_url(self, anylist_client):
        """Test get_server_url builds correct URL."""
        result = anylist_client.get_server_url("items")
        assert result == "http://localhost:8080/items"

    def test_populate_item_updates_name(self, anylist_client):
        """Test populate_item_updates handles name."""
        item = {}
        updates = {ATTR_NAME: "  test item  "}
        anylist_client.populate_item_updates(item, updates)
        assert item[ATTR_NAME] == "test item"

    def test_populate_item_updates_checked(self, anylist_client):
        """Test populate_item_updates handles checked status."""
        item = {}
        updates = {ATTR_CHECKED: True}
        anylist_client.populate_item_updates(item, updates)
        assert item[ATTR_CHECKED] is True

    def test_populate_item_updates_none(self, anylist_client):
        """Test populate_item_updates handles None updates."""
        item = {}
        anylist_client.populate_item_updates(item, None)
        assert item == {}

    @pytest.mark.asyncio
    async def test_add_item_success(self, anylist_client):
        """Test successful add_item call."""
        with patch.object(anylist_client, '_make_request') as mock_request:
            mock_request.return_value = (200, {})
            
            result = await anylist_client.add_item("test item", list_name="Shopping")
            
            assert result == 200
            mock_request.assert_called_once()
            args, kwargs = mock_request.call_args
            assert args[0] == "POST"
            assert args[1] == "add"
            assert kwargs['json_data'][ATTR_NAME] == "test item"
            assert kwargs['json_data'][ATTR_LIST] == "Shopping"
            assert kwargs['json_data'][ATTR_CHECKED] == "False"

    @pytest.mark.asyncio
    async def test_remove_item_by_name_success(self, anylist_client):
        """Test successful remove_item_by_name call."""
        with patch.object(anylist_client, '_make_request') as mock_request:
            mock_request.return_value = (200, {})
            
            result = await anylist_client.remove_item_by_name("test item")
            
            assert result == 200
            mock_request.assert_called_once()
            args, kwargs = mock_request.call_args
            assert args[0] == "POST"
            assert args[1] == "remove"

    @pytest.mark.asyncio
    async def test_get_items_success(self, anylist_client):
        """Test successful get_items call."""
        mock_items = [
            {ATTR_NAME: "item1", ATTR_CHECKED: False},
            {ATTR_NAME: "item2", ATTR_CHECKED: True},
            {ATTR_NAME: "item3", ATTR_CHECKED: False},
        ]
        
        with patch.object(anylist_client, 'get_detailed_items') as mock_detailed:
            mock_detailed.return_value = (200, mock_items)
            
            code, items = await anylist_client.get_items()
            
            assert code == 200
            assert items == ["item1", "item3"]

    @pytest.mark.asyncio
    async def test_get_all_items_success(self, anylist_client):
        """Test successful get_all_items call."""
        mock_items = [
            {ATTR_NAME: "item1", ATTR_CHECKED: False},
            {ATTR_NAME: "item2", ATTR_CHECKED: True},
            {ATTR_NAME: "item3", ATTR_CHECKED: False},
        ]
        
        with patch.object(anylist_client, 'get_detailed_items') as mock_detailed:
            mock_detailed.return_value = (200, mock_items)
            
            code, (unchecked, checked) = await anylist_client.get_all_items()
            
            assert code == 200
            assert unchecked == ["item1", "item3"]
            assert checked == ["item2"]