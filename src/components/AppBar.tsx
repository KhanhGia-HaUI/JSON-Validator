import React, { ReactComponentElement } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useState } from 'react';
import json_parse from "../assets/json_parse"
import { Checkbox, FormControlLabel } from '@mui/material';
import stripJsonTrailingCommas from '../assets/strip_trailing_commas';

const JS_AppBar = () => {
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },

  });

  const [json_validator_area, set_validator_data] = useState("");

  const [handle_trailing_commas, handler_trailing_commas] = useState(false);

  const set_static_json_validator_data = (e:React.ChangeEvent<HTMLTextAreaElement>): void => {
    try {
      const json_test = json_parse((handle_trailing_commas) ?
        stripJsonTrailingCommas((e.nativeEvent as any)['srcElement']['value']) :
      (((e.nativeEvent as any)['srcElement']['value'])));
      set_validator_data(JSON.stringify(json_test, null, '\t'))
    } catch (error: any) {
      set_validator_data(error.message as string);
    }
  }

  const is_handler_trailing_commas = () => {
    if (handle_trailing_commas)
    {
      handler_trailing_commas(false);
    }
    else {
      handler_trailing_commas(true);
    }

  }

  return (
    <ThemeProvider theme={darkTheme}>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              JSON Validator
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '80vh',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                onChange={is_handler_trailing_commas}
              />
            }
            label="Allow trailing commas"
          />
          <TextareaAutosize
            aria-label="Beautiful textarea 1"
            placeholder="Beautiful textarea 1"
            minRows={25}
            maxRows={50}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '4px',
              fontSize: '16px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            onChange={set_static_json_validator_data}
            id="original_json_paste_area"
          />
          <TextareaAutosize
            aria-label="Read-Only"
            placeholder="Read-Only"
            minRows={25}
            maxRows={25}
            readOnly
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '4px',
              fontSize: '16px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            defaultValue= {json_validator_area}
            id="json_validator_area"
          />
        </Box>
      </div>
    </ThemeProvider>
  );
};

export default JS_AppBar;
