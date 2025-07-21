"""Tests for the anylist server module."""

import os
import stat
import pytest
from unittest.mock import Mock, patch, MagicMock

from custom_components.anylist.server import AnylistServer, start_server


@pytest.fixture
def mock_config_entry():
    """Create a mock config entry with server binary configuration."""
    config_entry = Mock()
    config_entry.data = {
        "server_binary": "/path/to/binary",
        "email": "test@example.com",
        "password": "testpassword",
    }
    return config_entry


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    hass = Mock()
    hass.config = Mock()
    hass.config.path = Mock(return_value="/tmp/test_credentials")
    hass.bus = Mock()
    return hass


class TestAnylistServer:
    """Test the AnylistServer class."""

    def test_server_initialization(self):
        """Test server initialization."""
        args = ["binary", "--port", "8080"]
        server = AnylistServer(args)
        
        assert server.args == args
        assert server.process is None
        assert server.available is False

    def test_server_available_property(self):
        """Test the available property."""
        server = AnylistServer(["binary"])
        
        # Test when process is None
        assert server.available is False
        
        # Test when process is running
        mock_process = Mock()
        mock_process.poll.return_value = None
        server.process = mock_process
        assert server.available is True
        
        # Test when process has exited
        mock_process.poll.return_value = 0
        assert server.available is False

    def test_server_stop(self):
        """Test server stop method."""
        server = AnylistServer(["binary"])
        mock_process = Mock()
        server.process = mock_process
        
        server.stop()
        mock_process.terminate.assert_called_once()

    def test_server_stop_no_process(self):
        """Test server stop when no process exists."""
        server = AnylistServer(["binary"])
        # Should not raise an exception
        server.stop()


class TestStartServer:
    """Test the start_server function."""

    def test_start_server_missing_binary(self, mock_hass, mock_config_entry):
        """Test start_server returns None when binary is missing."""
        mock_config_entry.data["server_binary"] = None
        
        result = start_server(mock_hass, mock_config_entry)
        assert result is None

    def test_start_server_missing_email(self, mock_hass, mock_config_entry):
        """Test start_server returns None when email is missing."""
        mock_config_entry.data["email"] = None
        
        result = start_server(mock_hass, mock_config_entry)
        assert result is None

    def test_start_server_missing_password(self, mock_hass, mock_config_entry):
        """Test start_server returns None when password is missing."""
        mock_config_entry.data["password"] = None
        
        result = start_server(mock_hass, mock_config_entry)
        assert result is None

    @patch('custom_components.anylist.server.os.path.isfile')
    def test_start_server_binary_not_found(self, mock_isfile, mock_hass, mock_config_entry):
        """Test start_server raises error when binary file not found."""
        mock_isfile.return_value = False
        
        with pytest.raises(Exception, match="Failed to locate server binary"):
            start_server(mock_hass, mock_config_entry)

    @patch('custom_components.anylist.server.os.access')
    @patch('custom_components.anylist.server.os.path.isfile')
    @patch('custom_components.anylist.server.AnylistServer')
    def test_start_server_success(
        self, mock_server_class, mock_isfile, mock_access, mock_hass, mock_config_entry
    ):
        """Test successful server start."""
        mock_isfile.return_value = True
        mock_access.return_value = True
        mock_server_instance = Mock()
        mock_server_class.return_value = mock_server_instance
        
        result = start_server(mock_hass, mock_config_entry)
        
        assert result == mock_server_instance
        mock_server_instance.start.assert_called_once()
        mock_hass.bus.async_listen_once.assert_called_once()

    @patch('custom_components.anylist.server.os.chmod')
    @patch('custom_components.anylist.server.os.stat')
    @patch('custom_components.anylist.server.os.access')
    @patch('custom_components.anylist.server.os.path.isfile')
    @patch('custom_components.anylist.server.AnylistServer')
    def test_start_server_fix_permissions(
        self, mock_server_class, mock_isfile, mock_access, mock_stat, mock_chmod, mock_hass, mock_config_entry
    ):
        """Test server start with permission fixing."""
        mock_isfile.return_value = True
        mock_access.side_effect = [False, True]  # Not executable first, then executable
        mock_stat_result = Mock()
        mock_stat_result.st_mode = 0o644
        mock_stat.return_value = mock_stat_result
        mock_server_instance = Mock()
        mock_server_class.return_value = mock_server_instance
        
        result = start_server(mock_hass, mock_config_entry)
        
        assert result == mock_server_instance
        mock_chmod.assert_called_once_with("/path/to/binary", 0o644 | stat.S_IEXEC)

    @patch('custom_components.anylist.server.os.access')
    @patch('custom_components.anylist.server.os.path.isfile')
    def test_start_server_permission_fix_fails(
        self, mock_isfile, mock_access, mock_hass, mock_config_entry
    ):
        """Test server start when permission fix fails."""
        mock_isfile.return_value = True
        mock_access.return_value = False  # Always not executable
        
        with patch('custom_components.anylist.server.os.chmod'), \
             patch('custom_components.anylist.server.os.stat'):
            with pytest.raises(Exception, match="Failed to fix server binary permissions"):
                start_server(mock_hass, mock_config_entry)