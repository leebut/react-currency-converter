import { useEffect, useState } from "react";

import "./App.css";

const apiStem = "https://api.frankfurter.app/latest?amount=10&from=GBP&to=USD";
const allCurrencies = "https://api.frankfurter.app/currencies";

export default function App() {
  const [convList, setConvList] = useState([]);
  const [convAmount, setConvAmount] = useState(0);
  const [convFromCurr, setConvFromCurr] = useState(null);
  const [convToCurr, setConvToCurr] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        setIsLoading(true);
        const res = await fetch(allCurrencies);
        if (!res.ok) throw new Error("Problem getting currency list.");

        const data = await res.json();
        if (!data) throw new Error("No available currencies to convert");
        setConvList(Object.keys(data).map((key) => [key, data[key]]));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCurrencies();
  }, []);

  function handleAmount(amount) {
    setConvAmount(amount);
    console.log(convAmount);
  }

  function handleConvertFrom(curr) {
    setConvFromCurr(curr);
    console.log(convFromCurr);
  }

  function handleConvertTo(curr) {
    setConvToCurr(curr);
    console.log(convToCurr);
  }

  return (
    <>
      <h1 className="text-4xl text-purple-600">Currency Converter</h1>

      <ConvertBox>
        <Amount onHandleAmount={handleAmount} />
        {/* <ConvertFrom onHandleConvertFrom={handleConvertFrom} />
        <ConvertTo onHandleConvertTo={handleConvertTo} /> */}
        {!isLoading && !error ? (
          <AvailableCurrenciesSelect
            convList={convList}
            convert={"from"}
            onHandleConvertFrom={handleConvertFrom}
          />
        ) : (
          <Loader />
        )}
        {!isLoading && !error ? (
          <AvailableCurrenciesSelect
            convList={convList}
            convert={"to"}
            onHandleConvertTo={handleConvertTo}
          />
        ) : (
          <Loader />
        )}
      </ConvertBox>
    </>
  );
}

function Loader() {
  return (
    <>
      <h2 className="text-6xl font-bold mx-10">Loading...</h2>;
    </>
  );
}

function ConvertBox({ children }) {
  return (
    <div className="flex flex-col w-[20rem] gap-3 mt-5 mx-5">{children}</div>
  );
}

function Amount({ onHandleAmount }) {
  return (
    <input
      type="number"
      placeholder="Amount to convert"
      onChange={(e) => onHandleAmount(e.target.value)}
      className="text-2xl bg-orange-200 border-2 border-orange-600 p-1 placeholder-blue-800"
    ></input>
  );
}

function AvailableCurrenciesSelect({
  convList,
  convert,
  onHandleConvertFrom,
  onHandleConvertTo,
}) {
  return (
    <>
      <select
        className="text-2xl"
        onChange={(e) =>
          convert === "from"
            ? onHandleConvertFrom(e.target.value)
            : onHandleConvertTo(e.target.value)
        }
      >
        <option value="">
          {convert === "from" ? "Convert from..." : "Convert to..."}
        </option>
        {convList?.map((currency) => (
          <CurrencyCode currency={currency} key={currency[0]} />
        ))}
      </select>
    </>
  );
}

function CurrencyCode({ currency }) {
  return (
    <option
      value={currency[0]}
      className="text-2xl even:bg-green-700 odd: bg-orange-500"
    >
      {currency[0]} {currency[1]}
    </option>
  );
}
