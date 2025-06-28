import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  SportsGolf as GolfIcon,
  Person as PersonIcon,
  Add as AddIcon,
  List as ListIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { UI_CONSTANTS } from '../../constants';

const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // ドロワーの開閉
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // ユーザーメニューの開閉
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleUserMenuClose();
  };

  // ナビゲーション項目
  const navigationItems = [
    {
      text: 'ダッシュボード',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      text: 'ラウンド一覧',
      icon: <ListIcon />,
      path: '/rounds',
    },
    {
      text: '新規ラウンド',
      icon: <AddIcon />,
      path: '/rounds/new',
    },
  ];

  // ナビゲーション項目のクリック処理
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // 現在のパスがアクティブかチェック
  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // ドロワーの内容
  const drawerContent = (
    <Box>
      {/* ロゴエリア */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          minHeight: UI_CONSTANTS.HEADER_HEIGHT,
        }}
      >
        <GolfIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" noWrap>
          ゴルフスコア
        </Typography>
      </Box>

      <Divider />

      {/* ナビゲーションメニュー */}
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isActivePath(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* アプリバー */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${UI_CONSTANTS.DRAWER_WIDTH}px)` },
          ml: { md: `${UI_CONSTANTS.DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          {/* モバイル用メニューボタン */}
          <IconButton
            color="inherit"
            aria-label="メニューを開く"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* ページタイトル */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {location.pathname === '/' || location.pathname === '/dashboard'
              ? 'ダッシュボード'
              : location.pathname.startsWith('/rounds/new')
              ? '新規ラウンド'
              : location.pathname.startsWith('/rounds')
              ? 'ラウンド管理'
              : location.pathname.startsWith('/profile')
              ? 'プロフィール'
              : 'ゴルフスコア管理'}
          </Typography>

          {/* ユーザーアバター */}
          <IconButton
            size="large"
            aria-label="ユーザーメニュー"
            aria-controls="user-menu"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
          >
            <Avatar
              src={currentUser?.avatar}
              sx={{ width: 32, height: 32 }}
            >
              {currentUser?.name?.charAt(0) || <PersonIcon />}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* ユーザーメニュー */}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          プロフィール
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          ログアウト
        </MenuItem>
      </Menu>

      {/* サイドナビゲーション */}
      <Box
        component="nav"
        sx={{ width: { md: UI_CONSTANTS.DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* モバイル用ドロワー */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // パフォーマンス向上
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: UI_CONSTANTS.DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* デスクトップ用ドロワー */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: UI_CONSTANTS.DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${UI_CONSTANTS.DRAWER_WIDTH}px)` },
          mt: `${UI_CONSTANTS.HEADER_HEIGHT}px`,
          minHeight: `calc(100vh - ${UI_CONSTANTS.HEADER_HEIGHT}px)`,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;