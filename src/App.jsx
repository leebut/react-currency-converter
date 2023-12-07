import { useEffect, useState } from "react";

import "./App.css";

const apiStem = "https://api.frankfurter.app/latest?amount=10&from=GBP&to=USD";
const allCurrencies = "https://api.frankfurter.app/currencies";

export default function App() {
  const [convList, setConvList] = useState(null);
  const [convAmount, setConvAmount] = useState(0);
  const [convFromCurr, setConvFromCurr] = useState(null);
  const [convToCurr, setConvToCurr] = useState(null);
  const [convertedFinal, setConvertedFinal] = useState("");
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
  }

  function handleConvertFrom(curr) {
    setConvFromCurr(curr);
  }

  function handleConvertTo(curr) {
    setConvToCurr(curr);
  }

  // Listen for the all three values to exist to fire the conversion.
  // Debounce the input so that API calls are not instant.
  useEffect(
    function () {
      if (convAmount && convFromCurr && convToCurr) {
        const timerId = setTimeout(() => {
          handleGetConversions(convAmount, convFromCurr, convToCurr);
        }, 1000);
        return () => clearTimeout(timerId);
      }
    },
    [convAmount, convFromCurr, convToCurr]
  );

  async function handleGetConversions(convAmount, convFromCurr, convToCurr) {
    // if (!convAmount || !convFromCurr || !convToCurr) {
    //   return;
    // }
    try {
      setIsLoading(true);
      const res = await fetch(
        `https://api.frankfurter.app/latest?amount=${convAmount}&from=${convFromCurr}&to=${convToCurr}`
      );
      if (!res.ok) throw new Error("Problem getting currency conversion.");

      const data = await res.json();
      if (!data) throw new Error("No available conversion.");

      setConvertedFinal(data.rates[convToCurr]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-4xl text-purple-600">Currency Converter</h1>

      <ConvertBox>
        <Amount
          onHandleAmount={handleAmount}
          // onHandleGetConversions={handleGetConversions}
        />

        {/* Select box for the convert from currency */}
        {!isLoading && !error ? (
          <AvailableCurrenciesSelect
            convList={convList}
            convert={"from"}
            onHandleConvertFrom={handleConvertFrom}
            convFromCurr={convFromCurr}
            convToCurr={convToCurr}

            // onHandleGetConversions={handleGetConversions}
          />
        ) : (
          <Loader />
        )}

        {/* Select box for the convert from currency */}
        {!isLoading && !error ? (
          <AvailableCurrenciesSelect
            convList={convList}
            convert={"to"}
            onHandleConvertTo={handleConvertTo}
            convFromCurr={convFromCurr}
            convToCurr={convToCurr}
            // onHandleGetConversions={handleGetConversions}
          />
        ) : (
          <Loader />
        )}
        <ConvertedMessage
          convAmount={convAmount}
          convFromCurr={convFromCurr}
          convToCurr={convToCurr}
          convertedFinal={convertedFinal}
        />
      </ConvertBox>
    </>
  );
}

function Loader() {
  return (
    <>
      <h2 className="text-2xl font-bold mx-10 text-red-800">Loading...</h2>;
    </>
  );
}

function ConvertBox({ children }) {
  return (
    <div className="flex flex-col w-[50rem] gap-3 mt-5 mx-5">{children}</div>
  );
}

function Amount({ onHandleAmount, onHandleGetConversions }) {
  return (
    <input
      type="number"
      placeholder="Amount to convert"
      onChange={(e) => {
        onHandleAmount(e.target.value);
        // onHandleGetConversions();
      }}
      className="text-3xl bg-orange-200 border-2 border-orange-600 p-2 placeholder-blue-800 outline-none"
    ></input>
  );
}

function AvailableCurrenciesSelect({
  convList,
  convert,
  onHandleConvertFrom,
  onHandleConvertTo,
  onHandleGetConversions,
  convFromCurr,
  convToCurr,
}) {
  return (
    <>
      <select
        className="text-3xl p-2 outline-none border-[1px] border-blue-700"
        onChange={(e) =>
          convert === "from"
            ? onHandleConvertFrom(e.target.value)
            : onHandleConvertTo(e.target.value)
        }

        // convert === "from"
        // ? (onHandleConvertFrom(e.target.value), onHandleGetConversions())
        //     : (onHandleConvertTo(e.target.value), onHandleGetConversions())
      >
        <option className="text-3xl" value="">
          {convert === "from" ? "Convert from..." : "Convert to..."}
        </option>
        {convList?.map((currency) => (
          <CurrencyCode
            currency={currency}
            key={currency[0]}
            convFromCurr={convFromCurr}
            convToCurr={convToCurr}
          />
        ))}
      </select>
    </>
  );
}

function CurrencyCode({ currency, convFromCurr, convToCurr }) {
  return (
    <option
      value={currency[0]}
      className="text-3xl even:bg-orange-200 odd: bg-orange-300"
    >
      {currency[0]} {currency[1]}
    </option>
  );
}

function ConvertedMessage({
  convAmount,
  convFromCurr,
  convToCurr,
  convertedFinal,
}) {
  return convertedFinal > 0 ? (
    <>
      <p className="text-4xl">
        Converting from{" "}
        <span className="text-orange-500 font-bold"> {convFromCurr} </span> into{" "}
        <span className="text-orange-500 font-bold">{convToCurr}</span>.
      </p>
      <p className="text-4xl">
        You will receive{" "}
        <span className="text-green-500 font-bold">
          {convertedFinal} {convToCurr}
        </span>{" "}
        from{" "}
        <span className="text-purple-500 font-bold">
          {convAmount} {""}
          {convFromCurr}
        </span>
        .
      </p>
    </>
  ) : (
    <p className="text-4xl">Currencies or value not selected.</p>
  );
}
