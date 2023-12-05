import { useState } from 'react'

import './App.css'

const apiStem = "https://api.frankfurter.app/latest?amount=10&from=GBP&to=USD";
const allCurrencies="https://api.frankfurter.app/currencies";


export default function App() {
  const [convAmount, setConvAmount] = useState(0);
  const [convFromCurr, setConvFromCurr] = useState(null);

  function handleAmount(amount) {
    setConvAmount(amount);
    console.log(convAmount)
  }

  function handleConvertFrom(curr){
    setConvFromCurr(curr);
    console.log(convFromCurr);
  }


  return (
    <>
      <h1 className="text-4xl text-purple-600">Currency Converter</h1>
      <ConvertBox>
      <Amount onHandleAmount={handleAmount}/>
      <ConvertFrom onHandleConvertFrom={handleConvertFrom}/>
      <ConvertTo />
      </ConvertBox>
    </>
  )
}

function ConvertBox({children}){
  return (
    <div className="flex flex-col w-56 gap-3">{children}</div>
  )
}

function Amount ({onHandleAmount}) {
return <input type='number' placeholder='Amount to convert' onChange={(e) => onHandleAmount(e.target.value)}></input>
}

function ConvertFrom({onHandleConvertFrom}) {
  return <>
  <label htmlFor="from">From: </label>
<select name="from" onChange={(e) => onHandleConvertFrom(e.target.value)}>
  <option value="GBP">GBP</option>
  <option value="USD">USD</option>
  <option value="EUR">EUR</option>
</select>
</>
}
function ConvertTo(){
  return <>
  <label htmlFor="to">To: </label>
<select name="to">
  <option value="GBP">GBP</option>
  <option value="USD">USD</option>
  <option value="EUR">EUR</option>
</select>
</>
}

