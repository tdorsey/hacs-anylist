"""Tests for the anylist integration."""

import pytest
<<<<<<< HEAD
from unittest.mock import AsyncMock, Mock
=======
from unittest.mock import Mock
>>>>>>> e008f3f (Add GitHub Actions workflows for linting, formatting and testing (#14))

from custom_components.anylist.const import DOMAIN


<<<<<<< HEAD
def test_domain_constant() -> None:
=======
def test_domain_constant():
>>>>>>> e008f3f (Add GitHub Actions workflows for linting, formatting and testing (#14))
    """Test that the domain constant is correct."""
    assert DOMAIN == "anylist"


@pytest.mark.asyncio
<<<<<<< HEAD
async def test_async_setup_entry() -> None:
=======
async def test_async_setup_entry():
>>>>>>> e008f3f (Add GitHub Actions workflows for linting, formatting and testing (#14))
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
<<<<<<< HEAD

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
=======
    
    config_entry = Mock()
    config_entry.data = {
        "server_addr": "http://localhost:8080",
        "email": "test@example.com", 
        "password": "test",
        "server_binary": None
    }
    config_entry.options = {}
    
    # Mock the platforms setup
    hass.config_entries.async_forward_entry_setups = Mock(return_value=True)
    
    # Test that setup returns True
    result = await async_setup_entry(hass, config_entry)
    assert result is True
    assert DOMAIN in hass.data
>>>>>>> e008f3f (Add GitHub Actions workflows for linting, formatting and testing (#14))
