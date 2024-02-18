import * as React from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


export default function TwoTabPanel(props) {
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [textSnackbarSuccess, setTextSnackbarSuccess] = React.useState('')
  const [textSnackbarError, setTextSnackbarError] = React.useState('')
  const [openError, setOpenError] = React.useState(false);
  const { value, index, client } = props;
  const [plus, setPlus] = React.useState(0);
  const [minus, setMinus] = React.useState(0);
  const [multi, setMulti] = React.useState(0);
  const [divide, setDivide] = React.useState(0);
  const onChangePlus = (event) => {
    setPlus(event.target.value);
  }
  const onChangeMinus = (event) => {
    setMinus(event.target.value);
  }
  const onChangeMulti = (event) => {
    setMulti(event.target.value);
  }
  const onChangeDivide = (event) => {
    setDivide(event.target.value);
  }
  React.useEffect(() => {
    const getOperators = () => {
      client
        .get('duration')
        .then((response) => {
          setPlus(response.data.plus)
          setMinus(response.data.minus)
          setMulti(response.data.multi)
          setDivide(response.data.divide)
        })
    }
    getOperators()    
  }, [])
  const sendOperators = () => {
    client
      .post('duration', {
        plus: plus,
        minus: minus,
        multi: multi,
        divide: divide
      })
      .then((response) => {
          console.log(response)
          setPlus(response.data.plus)
          setMinus(response.data.minus)
          setMulti(response.data.multi)
          setDivide(response.data.divide)
          setOpenSuccess(false)
          setTextSnackbarSuccess(`Данные успешно загружены на сервер`)
          setOpenSuccess(true)
      })
      .catch(error => {
        console.log(error)
        setTextSnackbarError(`Введенные данные некорректны!`)
        setOpenError(true)
      })
  }
  const handleCloseSuccess = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSuccess(false);
  };
  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };
 
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
    >
      {value === index && (
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid sx={{m: 3}} item md={2}>
              <Typography variant="body1" gutterBottom>
                Введите продолжительность для каждой операции<br />
                Продолжительность измеряется в секундах!<br />
                Данные могут быть целые числа от 0 до 9*10^18 <br/>
              </Typography>
              <TextField 
                id="plus"
                label="Значение для плюса"
                value={plus}
                sx={{ mt: 1, mb: 1 }}
                onChange={onChangePlus}
              />
              <TextField 
                id="plus"
                label="Значение для минуса"
                value={minus}
                sx={{ mt: 1, mb: 1 }}
                onChange={onChangeMinus}
              />
              <TextField 
                id="plus"
                label="Значение для умножить"
                value={multi}
                sx={{ mt: 1, mb: 1 }}
                onChange={onChangeMulti}
              />
              <TextField 
                id="plus"
                label="Значение для разделить"
                value={divide}
                sx={{ mt: 1, mb: 1 }}
                onChange={onChangeDivide}
              />
              <Button
                variant="contained"
                onClick={() => sendOperators()}
                sx={{ mt: 3, mb: 2 }}
              >Отправить</Button>
            </Grid>
          </Grid>
        </Box>      
      )}
      <Snackbar open={openSuccess} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {textSnackbarSuccess}
        </Alert>
      </Snackbar>
      <Snackbar open={openError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert
          onClose={handleCloseError}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {textSnackbarError}
        </Alert>
      </Snackbar>
    </div>
  );
}
