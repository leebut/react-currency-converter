import { useEffect, useState } from "react";

import "./App.css";

// https://api.frankfurter.app/latest?amount=10&from=GBP&to=USD

// Get the available currencies from the API endpoint, /currencies.
// Use in the effect with async function fetchCurrencies(){}.

const allCurrencies = "https://api.frankfurter.app/currencies";

export default function App() {
  const [convList, setConvList] = useState(null);
  const [convAmount, setConvAmount] = useState(0);
  const [convFromCurr, setConvFromCurr] = useState("");
  const [convToCurr, setConvToCurr] = useState("");
  const [convertedFinal, setConvertedFinal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingRates, setIsGettingRates] = useState(false);

  const [error, setError] = useState("");

  // Dynamic title to show conversion
  const titleChanger = `${convAmount} ${convFromCurr} is ${convertedFinal} ${convToCurr}.`;
  console.log(titleChanger.length);

  const convFcurr = convFromCurr;
  const convTcurr = convToCurr;

  useEffect(() => {
    if (!convFromCurr || !convToCurr) return;
    if (convFcurr === convTcurr) {
      document.title = "Cannot convert same currency.";
      return;
    }
    document.title = titleChanger;

    // Cleanup function
    return function () {
      document.title = "React Currency Converter";
    };
  }, [
    convFromCurr,
    convToCurr,
    titleChanger,
    convFcurr,
    convTcurr,
    setConvAmount,
  ]);

  // Fetch current currency list from the API.
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
    setConvAmount(Number(amount));
    if (!amount) {
      setConvertedFinal(Number(0));
    }
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
    if (convFromCurr === convToCurr) {
      return;
    }
    try {
      setIsGettingRates(true);
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
      setIsGettingRates(false);
    }
  }

  return (
    <>
      <h1 className="text-5xl font-bold text-purple-600">Currency Converter</h1>

      <ConvertBox>
        <Amount onHandleAmount={handleAmount} />

        {/* Select box for the convert from currency */}
        {!isLoading && !error ? (
          <AvailableCurrenciesSelect
            convList={convList}
            convert={"from"}
            onHandleConvertFrom={handleConvertFrom}
            convFromCurr={convFromCurr}
            convToCurr={convToCurr}
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
          />
        ) : (
          <Loader />
        )}

        {!isGettingRates && !error ? (
          <ConvertedMessage
            convAmount={convAmount}
            convFromCurr={convFromCurr}
            convToCurr={convToCurr}
            convertedFinal={convertedFinal}
            setConvertedFinal={setConvertedFinal}
          />
        ) : (
          <GettingRates />
        )}
      </ConvertBox>
      <Footer />
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

function GettingRates() {
  return (
    <h2 className="text-4xl font-bold mx-10 text-red-800">Getting rates...</h2>
  );
}

function ConvertBox({ children }) {
  return (
    <div className="flex flex-col w-[40rem] gap-3 mt-5 mx-5">{children}</div>
  );
}

function Amount({ onHandleAmount }) {
  return (
    <input
      type="number"
      placeholder="Amount to convert"
      onChange={(e) => {
        onHandleAmount(e.target.value);
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
  convFromCurr,
  convToCurr,
}) {
  return (
    <>
      <select
        className="text-3xl p-2 outline-none border-[1px] border-blue-700 focus:bg-green-300 transition-all duration-500"
        onChange={(e) =>
          convert === "from"
            ? onHandleConvertFrom(e.target.value)
            : onHandleConvertTo(e.target.value)
        }
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

function CurrencyCode({ currency }) {
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
  setConvertedFinal,
}) {
  const sameCurrError = (
    <p className="text-4xl text-red-800 font-bold">
      Cannot convert the same currency.
    </p>
  );

  if (convFromCurr === convToCurr && convFromCurr !== "" && convToCurr !== "") {
    return sameCurrError;
  }

  return convertedFinal > 0 ? (
    <div className="mt-5 bg-yellow-100 p-2">
      <p className="text-3xl">
        Converting from{" "}
        <span className="text-orange-500 font-bold"> {convFromCurr} </span> into{" "}
        <span className="text-orange-500 font-bold">{convToCurr}</span>.
      </p>
      <p className="text-3xl">
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
    </div>
  ) : (
    <p className="text-4xl text-red-800 font-bold">
      Currencies or value not selected.
    </p>
  );
}

function Footer() {
  return (
    <div className="w-[50rem] pl-4">
      <p className="text-3xl bg-red-300 p-2 mt-5 mb-2">
        <span className="font-bold">Note: </span>Rates are updated by the API
        service around <span className="font-bold">4pm CET</span>.
        <br />
      </p>
      <p className="text-3xl bg-red-300 p-2">
        Do not use these rates for financial purposes.
        <br />I am learning React, and this is a learning project.
      </p>
    </div>
  );
}
