 
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
} from '@mui/material';

interface ActivityItem {
  id: number;
  name: string;
  action: string;
  time: string;
  avatar?: string;
}

const RecentActivityFeed = () => {
  const activities: ActivityItem[] = [
    {
      id: 1,
      name: 'John Doe',
      action: 'Added new patient record',
      time: '2 minutes ago',
    },
    {
      id: 2,
      name: 'Jane Smith',
      action: 'Updated equipment calibration',
      time: '15 minutes ago',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      action: 'Completed quality check',
      time: '1 hour ago',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      action: 'Generated monthly report',
      time: '2 hours ago',
    },
    {
      id: 5,
      name: 'David Brown',
      action: 'Configured new parameter',
      time: '3 hours ago',
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
          Recent Activity
        </Typography>

        <List sx={{ px: 0 }}>
          {activities.map((activity) => (
            <ListItem
              key={activity.id}
              sx={{
                px: 0,
                py: 1.5,
                borderBottom: '1px solid #f3f4f6',
                transition: 'background-color 0.2s ease',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': {
                  backgroundColor: '#fafafa',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: '#14b8a6',
                    width: 40,
                    height: 40,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {getInitials(activity.name)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      {activity.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                      {activity.action}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem', mt: 0.5 }}>
                    {activity.time}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
