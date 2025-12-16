import React from 'react';
import search_icon_incubatorassignees from "../../assets/icons/search_icon_incubatorassignees.svg";
import List_incubatorassignees from "../../assets/icons/List_incubatorassignees.svg";

import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';

interface AssigneePanelProps {
  equipmentId: number;
}

const AssigneePanel: React.FC<AssigneePanelProps> = ({ equipmentId }) => {
  return (
    <Box sx={{ height: '100%' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* HEADER */}
        <CardContent
          sx={{
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Incubator Assignees
          </Typography>

          <Box
            component="img"
            src={search_icon_incubatorassignees}
            alt="search"
            sx={{
              width: 24,
              height: 24,
              cursor: 'pointer',
            }}
          />
        </CardContent>

        {/* BODY */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          {/* SVG fills available card space */}
          <Box
            component="img"
            src={List_incubatorassignees}
            alt="assignee_list"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default AssigneePanel;
