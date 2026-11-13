import re
from dataclasses import dataclass, field
from typing import Optional

from app.schemas.voice import Measurements


WORD_NUMBER = (
    r"(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|"
    r"thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|"
    r"thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|point)"
)
NUMBER = rf"(\d+(?:\.\d+)?|{WORD_NUMBER}(?:\s+{WORD_NUMBER}){{0,5}})\b"
NUMBER_VALUES = {
    "zero": 0,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
    "eleven": 11,
    "twelve": 12,
    "thirteen": 13,
    "fourteen": 14,
    "fifteen": 15,
    "sixteen": 16,
    "seventeen": 17,
    "eighteen": 18,
    "nineteen": 19,
    "twenty": 20,
    "thirty": 30,
    "forty": 40,
    "fifty": 50,
    "sixty": 60,
    "seventy": 70,
    "eighty": 80,
    "ninety": 90,
}


@dataclass
class ExtractionResult:
    measurements: Measurements = field(default_factory=Measurements)
    warnings: list[str] = field(default_factory=list)

    @property
    def has_measurements(self) -> bool:
        return any(value is not None for value in self.measurements.model_dump().values())


def _parse_number(value: str) -> float:
    if re.fullmatch(r"\d+(?:\.\d+)?", value):
        return float(value)
    tokens = value.lower().split()
    if "point" in tokens:
        point_index = tokens.index("point")
        integer = _parse_number(" ".join(tokens[:point_index]))
        decimal = "".join(str(NUMBER_VALUES[token]) for token in tokens[point_index + 1:])
        return float(f"{int(integer)}.{decimal}")
    total = 0
    current = 0
    for token in tokens:
        if token == "hundred":
            current = max(current, 1) * 100
        else:
            current += NUMBER_VALUES[token]
    return float(total + current)


def _number(pattern: str, text: str) -> Optional[float]:
    match = re.search(pattern, text, flags=re.IGNORECASE)
    return _parse_number(match.group(1)) if match else None


def _temperature(text: str) -> tuple[Optional[float], Optional[str]]:
    match = re.search(
        rf"(?:body\s+)?temperature\s*(?:is|of|:)?\s*{NUMBER}\s*"
        r"(?:degrees?\s*)?(?P<unit>celsius|centigrade|fahrenheit|°c|°f)\b",
        text,
        flags=re.IGNORECASE,
    )
    if not match:
        if re.search(r"(?:body\s+)?temperature", text, flags=re.IGNORECASE):
            return None, "Temperature needs an explicit Celsius or Fahrenheit unit."
        return None, None
    value = _parse_number(match.group(1))
    unit = match.group("unit").lower()
    if unit in {"fahrenheit", "°f"}:
        value = (value - 32) * 5 / 9
    return round(value, 1), None


def extract_measurements(transcript: str) -> ExtractionResult:
    text = " ".join(transcript.strip().split())
    result = ExtractionResult()
    if not text:
        return result

    heart_rate = _number(
        rf"(?:heart\s+rate|pulse)\s*(?:is|of|at|:)?\s*{NUMBER}",
        text,
    )
    spo2 = _number(
        rf"(?:oxygen\s+saturation|oxygen|spo2|saturation)\s*(?:is|of|at|:)?\s*{NUMBER}\s*(?:percent|%)?",
        text,
    )
    pressure = re.search(
        rf"(?:blood\s+pressure|blood\s+bp|\bbp\b)\s*(?:is|of|at|:)?\s*{NUMBER}\s*"
        rf"(?:over|/|and)\s*{NUMBER}",
        text,
        flags=re.IGNORECASE,
    )
    systolic = _number(rf"(?:systolic)\s*(?:is|of|at|:)?\s*{NUMBER}", text)
    diastolic = _number(rf"(?:diastolic)\s*(?:is|of|at|:)?\s*{NUMBER}", text)
    temperature, temperature_warning = _temperature(text)
    glucose = _number(
        rf"(?:blood\s+(?:glucose|sugar)|glucose|blood\s+sugar)\s*(?:is|of|at|:)?\s*{NUMBER}"
        r"\s*(?:mg/dl|milligrams?\s+per\s+deciliter)",
        text,
    )
    sleep = _number(
        rf"(?:sleep(?:ed)?|slept|hours?\s+of\s+sleep|sleep\s+duration)\s*(?:for|is|of|:)?\s*{NUMBER}\s*"
        r"(?:hours?|hrs?)",
        text,
    )

    if pressure:
        systolic = _parse_number(pressure.group(1))
        diastolic = _parse_number(pressure.group(2))
    if heart_rate is not None:
        result.measurements.heart_rate = heart_rate
    if spo2 is not None:
        result.measurements.spo2 = spo2
    if systolic is not None:
        result.measurements.systolic_bp = systolic
    if diastolic is not None:
        result.measurements.diastolic_bp = diastolic
    if temperature is not None:
        result.measurements.body_temperature = temperature
    if glucose is not None:
        result.measurements.blood_glucose = glucose
    if sleep is not None:
        result.measurements.sleep_duration = sleep
    if temperature_warning:
        result.warnings.append(temperature_warning)
    if re.search(r"(?:blood\s+)?(?:glucose|sugar)", text, flags=re.IGNORECASE) and glucose is None:
        result.warnings.append("Blood glucose needs an explicit mg/dL unit.")
    return result
