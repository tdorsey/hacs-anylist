"""Tests for the anylist integration."""

import pytest
from unittest.mock import AsyncMock, Mock, patch

from custom_components.anylist.const import DOMAIN


def test_domain_constant() -> None:
    """Test that the domain constant is correct."""
    assert DOMAIN == "anylist"


@pytest.mark.asyncio
async def test_async_setup_entry() -> None:
    """Test async setup entry."""
    from custom_components.anylist import async_setup_entry
    
    # Mock the necessary objects
    hass = Mock()
    hass.data = {}
    hass.services = Mock()
    hass.config_entries = Mock()
    hass.bus = Mock()
    hass.config = Mock()
    hass.config.path = Mock(return_value="/tmp/test_credentials")

    config_entry = Mock()
    config_entry.data = {
        "server_addr": "http://localhost:8080",
        "email": "test@example.com",
        "password": "test",
        "server_binary": None,
    }
    config_entry.options = {}

    # Mock the async platforms setup
    hass.config_entries.async_forward_entry_setups = AsyncMock(return_value=True)
 
    # Test that setup returns True
    result = await async_setup_entry(hass, config_entry)
    assert result is True
    assert DOMAIN in hass.data


@pytest.mark.asyncio
async def test_async_setup_entry_with_server() -> None:
    """Test async setup entry with binary server."""
    from custom_components.anylist import async_setup_entry
    
    hass = Mock()
    hass.data = {}
    hass.services = Mock()
    hass.config_entries = Mock()
    hass.bus = Mock()
    hass.config = Mock()
    hass.config.path = Mock(return_value="/tmp/test_credentials")

    config_entry = Mock()
    config_entry.data = {
        "server_binary": "/path/to/binary",
        "email": "test@example.com",
        "password": "test",
    }
    config_entry.options = {}

    hass.config_entries.async_forward_entry_setups = AsyncMock(return_value=True)
    
    # Mock start_server to return a server instance
    with patch('custom_components.anylist.start_server') as mock_start_server:
        mock_server = Mock()
        mock_start_server.return_value = mock_server
        
        result = await async_setup_entry(hass, config_entry)
        
        assert result is True
        assert DOMAIN in hass.data
        assert hass.data[DOMAIN].binary_server == mock_server


@pytest.mark.asyncio
async def test_async_unload_entry() -> None:
    """Test async unload entry."""
    from custom_components.anylist import async_unload_entry
    from custom_components.anylist.client import AnylistClient
    from custom_components.anylist.server import AnylistServer
    
    hass = Mock()
    mock_client = Mock(spec=AnylistClient)
    mock_server = Mock(spec=AnylistServer)
    mock_client.binary_server = mock_server
    hass.data = {DOMAIN: mock_client}
    hass.config_entries = Mock()

    config_entry = Mock()
    
    # Mock the async platforms unload
    hass.config_entries.async_unload_platforms = AsyncMock(return_value=True)
    
    result = await async_unload_entry(hass, config_entry)
    
    assert result is True
    mock_server.stop.assert_called_once()
    assert DOMAIN not in hass.data


@pytest.mark.asyncio
async def test_async_unload_entry_no_server() -> None:
    """Test async unload entry without server."""
    from custom_components.anylist import async_unload_entry
    from custom_components.anylist.client import AnylistClient
    
    hass = Mock()
    mock_client = Mock(spec=AnylistClient)
    mock_client.binary_server = None
    hass.data = {DOMAIN: mock_client}
    hass.config_entries = Mock()

    config_entry = Mock()
    
    hass.config_entries.async_unload_platforms = AsyncMock(return_value=True)
    
    result = await async_unload_entry(hass, config_entry)
    
    assert result is True
    assert DOMAIN not in hass.data
