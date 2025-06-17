import React, { useState, useEffect, useCallback } from "react";

const BUTTONS = [
  ["C", "CE", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "⌫", "="],
];

const OPERATORS = {
  "+": (a, b) => a + b,
  "−": (a, b) => a - b,
  "×": (a, b) => a * b,
  "÷": (a, b) => b === 0 ? "Error" : a / b,
};

function formatNumber(n) {
  if (n === "Error" || n === "Infinity" || n === "-Infinity") return "Error";
  if (typeof n === "number" && !Number.isFinite(n)) return "Error";

  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num)) return "Error";

  if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6);
  }
  const str = num.toString();
  if (str.length > 12) {
    return parseFloat(num.toFixed(8)).toString();
  }
  return str;
}

function isOperator(btn) {
  return Object.keys(OPERATORS).includes(btn);
}

function mapKeyToButton(key) {
  const mapping = {
    "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
    "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
    ".": ".", ",": ".",
    "+": "+", "-": "−", "*": "×", "x": "×", "X": "×",
    "/": "÷", "÷": "÷",
    "=": "=", "Enter": "=",
    "Backspace": "⌫", "Delete": "⌫",
    "Escape": "C", "c": "C", "C": "C",
    "%": "%"
  };
  return mapping[key] || null;
}

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [lastPressed, setLastPressed] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [displayChanged, setDisplayChanged] = useState(false);
  const [calculatorLoaded, setCalculatorLoaded] = useState(false);

  // Animation trigger for display changes
  useEffect(() => {
    setDisplayChanged(true);
    const timer = setTimeout(() => setDisplayChanged(false), 200);
    return () => clearTimeout(timer);
  }, [display]);

  // Initial load animation
  useEffect(() => {
    const timer = setTimeout(() => setCalculatorLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const inputDigit = useCallback((digit) => {
    if (display === "Error") {
      setDisplay(String(digit));
      setWaitingForOperand(false);
      return;
    }
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      if (display === "0") {
        setDisplay(String(digit));
      } else {
        setDisplay(display + digit);
      }
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (display === "Error") {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay("0");
  }, []);

  const backspace = useCallback(() => {
    if (display === "Error") {
      setDisplay("0");
      return;
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  }, [display]);

  const percentage = useCallback(() => {
    if (display !== "Error") {
      const value = parseFloat(display) / 100;
      setDisplay(formatNumber(value));
    }
  }, [display]);

  const performCalculation = useCallback((nextOperator) => {
    const inputValue = parseFloat(display);

    if (display === "Error") {
      setOperator(nextOperator);
      setWaitingForOperand(true);
      return;
    }

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      const calc = OPERATORS[operator](currentValue, inputValue);

      setDisplay(formatNumber(calc));
      setPreviousValue(calc === "Error" ? null : calc);

      // Add to history
      const calculation = `${formatNumber(currentValue)} ${operator} ${formatNumber(inputValue)} = ${formatNumber(calc)}`;
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  }, [display, previousValue, operator]);

  const calculate = useCallback(() => {
    if (operator && previousValue !== null && display !== "Error") {
      performCalculation(null);
      setOperator(null);
      setPreviousValue(null);
      setWaitingForOperand(true);
    }
  }, [performCalculation, operator, previousValue, display]);

  const handleInput = useCallback((btn) => {
    setLastPressed(btn);

    if (btn >= "0" && btn <= "9") {
      inputDigit(btn);
    } else if (btn === ".") {
      inputDecimal();
    } else if (btn === "C") {
      clear();
    } else if (btn === "CE") {
      clearEntry();
    } else if (btn === "⌫") {
      backspace();
    } else if (btn === "%") {
      percentage();
    } else if (isOperator(btn)) {
      performCalculation(btn);
    } else if (btn === "=") {
      calculate();
    }
  }, [inputDigit, inputDecimal, clear, clearEntry, backspace, percentage, performCalculation, calculate]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const mapped = mapKeyToButton(e.key);
      if (mapped) {
        e.preventDefault();
        handleInput(mapped);
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleInput]);

  // Animate last pressed button
  useEffect(() => {
    if (lastPressed) {
      const timer = setTimeout(() => setLastPressed(null), 150);
      return () => clearTimeout(timer);
    }
  }, [lastPressed]);

  // Button style with enhanced animations
  const getButtonStyle = (btn) => {
    let baseStyle = `
      bg-white border border-black text-black font-semibold rounded-xl
      py-4 sm:py-5 text-xl sm:text-2xl
      transition-all duration-300 ease-out
      hover:opacity-80 hover:scale-105 hover:shadow-lg active:scale-95
      focus:outline-none
      select-none
      transform
    `;
    if (isOperator(btn)) {
      baseStyle += " bg-blue-100 hover:bg-blue-200";
    } else if (btn === "=") {
      baseStyle += " bg-green-100 text-black hover:bg-green-200";
    } else {
      baseStyle += " hover:bg-gray-50";
    }
    if (btn === lastPressed) {
      baseStyle += " ring-2 ring-black scale-95 bg-gray-200";
    }
    return baseStyle;
  };

  // Enhanced animations styles
  const animationStyles = `
    @keyframes fade-in {
      from { opacity: 0; transform: scale(0.95) translateY(-10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes slide-in-right {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slide-in-left {
      from { opacity: 0; transform: translateX(-100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes bounce-in {
      0% { opacity: 0; transform: scale(0.3); }
      50% { opacity: 1; transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes pulse-display {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.4s cubic-bezier(0.4,0,0.2,1);
    }
    .animate-slide-in-left {
      animation: slide-in-left 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .animate-bounce-in {
      animation: bounce-in 0.6s cubic-bezier(0.68,-0.55,0.265,1.55);
    }
    .animate-pulse-display {
      animation: pulse-display 0.2s ease-out;
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.3s ease-out;
    }
    .stagger-animation {
      animation-delay: calc(var(--stagger) * 50ms);
    }
  `;

  // INFO MODAL with enhanced animations
  const infoContent = (
    <div className="fixed left-20 top-6 z-50">
      <div className="bg-white border border-black rounded-xl shadow-lg max-w-md w-80 p-6 relative">
        <button
          className="absolute top-3 right-3 text-black hover:bg-gray-200 rounded-full p-1 transition-all duration-200 hover:scale-110"
          onClick={() => setShowInfo(false)}
          aria-label="Close information"
        >
          <svg width={22} height={22} fill="none" viewBox="0 0 22 22">
            <path d="M6 6l10 10M16 6L6 16" stroke="black" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </button>
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-black">About This App</h2>
        </div>
        <div className="text-black text-sm space-y-2">
          <div className="animate-fade-in-up stagger-animation" style={{"--stagger": 1}}>
            <strong>Application:</strong> Modern calculator built with React featuring smooth animations and intuitive design.
          </div>
          <div className="animate-fade-in-up stagger-animation" style={{"--stagger": 2}}>
            <strong>Developer:</strong> Created by The Ayn Pro with attention to detail and user experience.
          </div>
          <div className="animate-fade-in-up stagger-animation" style={{"--stagger": 3}}>
            <strong>Design:</strong> Minimalist interface crafted with Tailwind CSS for optimal usability.
          </div>
          <div className="animate-fade-in-up stagger-animation" style={{"--stagger": 4}}>
            <strong>Features:</strong> Supports keyboard input, calculation history, and responsive design for all devices.
          </div>
          <div className="animate-fade-in-up stagger-animation" style={{"--stagger": 5}}>
                       <strong>Author:</strong> @theaynapro <a className="text-blue-400" href="http://theapro.uz/">theapro.uz</a>

          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{animationStyles}</style>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-6xl p-4">
          <div className="flex gap-4">
            {/* Info Icon with animation */}
            <button
              onClick={() => setShowInfo(true)}
              className="fixed left-6 top-6 z-40 flex items-center justify-center w-10 h-10 text-black transition-all duration-300 hover:scale-110 hover:rotate-12 animate-bounce-in"
              aria-label="About this application"
              title="Learn more about this calculator"
            >
              <svg width={24} height={24} fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" fill="#e0e7ff"/>
                <text x="12" y="16" textAnchor="middle" fill="#2563eb" fontSize="14" fontFamily="Arial" dy="0">i</text>
              </svg>
            </button>

            {/* Calculator with entrance animation */}
            <div className={`w-full ml-[310px] max-w-sm sm:max-w-md md:max-w-lg relative transition-all duration-500 ${calculatorLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
              <div className="bg-white border border-black rounded-xl flex flex-col shadow-none transition-shadow duration-300">

                {/* History Button with animation */}
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="absolute left-3 top-3 text-xs bg-white text-black hover:bg-gray-100 px-2 py-1 border border-black rounded transition-all duration-300 z-10 hover:scale-105"
                  title={showHistory ? "Hide calculation history" : "Show calculation history"}
                >
                  {showHistory ? "Hide" : "History"}
                </button>

                {/* Display with pulse animation on change */}
                <div className={`text-right p-6 pb-4 font-mono text-3xl sm:text-4xl md:text-5xl border-b border-black break-words min-h-[4rem] flex items-center justify-end select-text transition-all duration-300 ${displayChanged ? 'animate-pulse-display' : ''}`}>
                  <div className="flex flex-col items-end w-full">
                    <div data-testid="display" className="transition-all duration-200">
                      {display}
                    </div>
                    <div className="text-sm text-gray-600 mt-2 font-mono min-h-[1.5em] h-[1.5em] w-full text-end transition-all duration-200">
                      {(operator && previousValue !== null)
                        ? `${formatNumber(previousValue)} ${operator}`
                        : "\u00A0"
                      }
                    </div>
                  </div>
                </div>

                {/* Buttons with staggered animation */}
                <div className="grid grid-cols-4 gap-3 p-4">
                  {BUTTONS.flat().map((btn, i) => (
                    <button
                      key={btn + i}
                      className={`${getButtonStyle(btn)} ${btn === "0" ? "col-span-2" : ""} animate-fade-in-up stagger-animation`}
                      style={{"--stagger": i}}
                      onClick={() => handleInput(btn)}
                      aria-label={
                        btn === "⌫" ? "Backspace" : 
                        btn === "C" ? "Clear all" :
                        btn === "CE" ? "Clear entry" :
                        btn === "%" ? "Percentage" :
                        btn === "÷" ? "Divide" :
                        btn === "×" ? "Multiply" :
                        btn === "−" ? "Subtract" :
                        btn === "+" ? "Add" :
                        btn === "=" ? "Equals" :
                        btn
                      }
                      title={
                        btn === "⌫" ? "Delete last digit" : 
                        btn === "C" ? "Clear all calculations" :
                        btn === "CE" ? "Clear current entry" :
                        btn === "%" ? "Convert to percentage" :
                        undefined
                      }
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* History Panel with slide animation */}
            {showHistory && (
              <div className="w-80 fixed right-[160px] bg-white border border-black rounded-xl shadow-none animate-slide-in-right">
                <div className="p-4 border-b border-black">
                  <h3 className="text-lg font-semibold text-black">Calculation History</h3>
                </div>
                <div className="h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-gray-500 text-sm p-4 text-center animate-fade-in">
                      No calculations yet.<br/>
                      <span className="text-xs">Start calculating to see your history here.</span>
                    </p>
                  ) : (
                    <div className="p-2">
                      {history.map((calc, index) => (
                        <div 
                          key={index} 
                          className="text-sm font-mono text-black py-2 px-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 cursor-pointer transition-all duration-200 hover:scale-105 hover:pl-4 animate-fade-in-up stagger-animation"
                          style={{"--stagger": index}}
                          title="Click to copy calculation"
                          onClick={() => navigator.clipboard?.writeText(calc)}
                        >
                          {calc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer with fade-in animation */}
          <div className={`text-center text-sm text-gray-500 mt-2 -mb-2 transition-all duration-500 ${calculatorLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <a 
              href="https://github.com/theapro" 
              className="hover:text-blue-600 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              © The Ayn Pro 2025. All rights reserved.
            </a>
          </div>
          
          {/* Info Modal */}
          {showInfo && infoContent}
        </div>
      </div>
    </>
  );
}