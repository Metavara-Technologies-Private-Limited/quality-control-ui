import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const UNIT_OPTIONS = [
  "°C",
  "°F",
  "m/s",
  "µg/m³",
  "%",
  "ppm",
  "pH",
  "mg/L",
  "ml",
  "l",
  "kg",
  "g",
  "m",
  "cm",
];

export const FIELD_TYPES = [
  "Integer",
  "Decimal",
  "Text",
  "Boolean",
  "Dropdown",
];

export function useAddParameterPopupLogic({
  open,
  initialData,
  onAdd,
  onClose,
}: {
  open: boolean;
  initialData?: any;
  onAdd: (data: any) => void;
  onClose: () => void;
}) {
  const resolveMandatoryFlag = (source: any): boolean => {
    const candidates = [
      source?.mandatory,
      source?.is_mandatory,
      source?.required,
      source?.is_required,
    ];

    for (const value of candidates) {
      if (value === true || value === 1 || value === "1" || value === "true") {
        return true;
      }
      if (
        value === false ||
        value === 0 ||
        value === "0" ||
        value === "false"
      ) {
        return false;
      }
    }

    return false;
  };

  // Common fields
  const [title, setTitle] = useState("");
  const [mandatory, setMandatory] = useState(false);
  const [fieldType, setFieldType] = useState("");

  // Integer fields
  const [integerDefault, setIntegerDefault] = useState("");
  const [integerUnit, setIntegerUnit] = useState("");
  const [integerMin, setIntegerMin] = useState("");
  const [integerMax, setIntegerMax] = useState("");

  // Decimal fields
  const [decimalDefault, setDecimalDefault] = useState("");
  const [decimalUnit, setDecimalUnit] = useState("");
  const [decimalMin, setDecimalMin] = useState("");
  const [decimalMax, setDecimalMax] = useState("");

  // Text fields
  const [textType, setTextType] = useState("single");
  const [textValue, setTextValue] = useState("");

  // Boolean fields
  const [booleanType, setBooleanType] = useState("yesno");

  // Dropdown fields
  const [dropdownMode, setDropdownMode] = useState<"single" | "multi">(
    "single",
  );
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([
    "Option 1",
    "Option 2",
  ]);
  const [selectedDropdownValues, setSelectedDropdownValues] = useState<
    string[]
  >([]);

  const loadInitialData = () => {
    if (!initialData) return;

    const dataType = initialData.field_type || initialData.data_type;

    setTitle(initialData.title || initialData.name || "");
    setMandatory(resolveMandatoryFlag(initialData));
    setFieldType(dataType);

    if (dataType === "Integer" || dataType === "Min/Max") {
      const defaultVal =
        initialData.default_value ??
        initialData.integer_value ??
        initialData.int_value ??
        "";

      setIntegerDefault(String(defaultVal));
      setIntegerUnit(initialData.unit || "");
      setIntegerMin(
        initialData.min_value !== null && initialData.min_value !== undefined
          ? String(initialData.min_value)
          : "",
      );
      setIntegerMax(
        initialData.max_value !== null && initialData.max_value !== undefined
          ? String(initialData.max_value)
          : "",
      );
    } else if (dataType === "Decimal") {
      const defaultVal =
        initialData.default_value ?? initialData.decimal_value ?? "";

      setDecimalDefault(String(defaultVal));
      setDecimalUnit(initialData.unit || "");
      setDecimalMin(
        initialData.min_value !== null && initialData.min_value !== undefined
          ? String(initialData.min_value)
          : "",
      );
      setDecimalMax(
        initialData.max_value !== null && initialData.max_value !== undefined
          ? String(initialData.max_value)
          : "",
      );
    } else if (dataType === "Text") {
      setTextType(initialData.text_type || "single");
      setTextValue(initialData.text || "");
    } else if (dataType === "Boolean") {
      setBooleanType(initialData.boolean_type || "yesno");
    } else if (dataType === "Dropdown") {
      let dropdownArray: string[] = [];

      if (Array.isArray(initialData.dropdown)) {
        dropdownArray = initialData.dropdown
          .map((d: any) => String(d))
          .filter(Boolean);
      } else if (typeof initialData.dropdown === "string") {
        dropdownArray = initialData.dropdown
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }

      setDropdownOptions(
        dropdownArray.length > 0 ? dropdownArray : ["Option 1", "Option 2"],
      );
      setDropdownMode(initialData.selection_type || "single");
    }
  };

  const resetForm = () => {
    setTitle("");
    setMandatory(false);
    setFieldType("");

    setIntegerDefault("");
    setIntegerUnit("");
    setIntegerMin("");
    setIntegerMax("");

    setDecimalDefault("");
    setDecimalUnit("");
    setDecimalMin("");
    setDecimalMax("");

    setTextType("single");
    setTextValue("");

    setBooleanType("yesno");

    setDropdownMode("single");
    setDropdownOptions(["Option 1", "Option 2"]);
    setSelectedDropdownValues([]);
  };

  const handleDropdownModeChange = (newMode: "single" | "multi") => {
    setDropdownMode(newMode);
    setSelectedDropdownValues([]);
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Please enter Title");
      return false;
    }

    if (!fieldType) {
      toast.error("Please select Field Type");
      return false;
    }

    if (fieldType === "Integer") {
      if (integerDefault === "") {
        toast.error("Please enter Default Value for Integer");
        return false;
      }
      if (integerMin === "") {
        toast.error("Please enter Minimum Value");
        return false;
      }
      if (integerMax === "") {
        toast.error("Please enter Maximum Value");
        return false;
      }
    }

    if (fieldType === "Decimal") {
      if (decimalDefault === "") {
        toast.error("Please enter Default Value for Decimal");
        return false;
      }
      if (decimalMin === "") {
        toast.error("Please enter Minimum Value");
        return false;
      }
      if (decimalMax === "") {
        toast.error("Please enter Maximum Value");
        return false;
      }
    }

    if (fieldType === "Text") {
      if (!textValue.trim()) {
        toast.error("Please enter Text value");
        return false;
      }
    }

    if (fieldType === "Dropdown") {
      const validOptions = dropdownOptions.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        toast.error("Please add at least 2 dropdown options");
        return false;
      }
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const payload: any = {
      title,
      name: title,
      mandatory,
      field_type: fieldType,
      data_type: fieldType,
    };

    if (fieldType === "Integer") {
      payload.default_value = integerDefault.trim()
        ? parseInt(integerDefault)
        : null;
      payload.integer_value = integerDefault.trim()
        ? parseInt(integerDefault)
        : null;
      payload.unit = integerUnit || null;
      payload.min_value = integerMin.trim() ? parseInt(integerMin) : null;
      payload.max_value = integerMax.trim() ? parseInt(integerMax) : null;
    }

    if (fieldType === "Decimal") {
      payload.default_value = decimalDefault.trim()
        ? parseFloat(decimalDefault)
        : null;
      payload.unit = decimalUnit || null;
      payload.min_value = decimalMin.trim() ? parseFloat(decimalMin) : null;
      payload.max_value = decimalMax.trim() ? parseFloat(decimalMax) : null;
    }

    if (fieldType === "Text") {
      payload.text_type = textType;
      payload.text = textValue.trim() || null;
      payload.default_value = textValue.trim() || null;
    }

    if (fieldType === "Boolean") {
      payload.boolean_type = booleanType;
      payload.default_value = null;
    }

    if (fieldType === "Dropdown") {
      payload.dropdown = dropdownOptions.filter((opt) => opt.trim());
      payload.selection_type = dropdownMode;
      payload.default_value = null;
    }

    if (initialData?.id) {
      payload.id = initialData.id;
    }

    onAdd(payload);
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (open) {
      if (initialData) {
        loadInitialData();
      } else {
        resetForm();
      }
    }
  }, [open, initialData]);

  return {
    title,
    setTitle,
    mandatory,
    setMandatory,
    fieldType,
    setFieldType,

    integerDefault,
    setIntegerDefault,
    integerUnit,
    setIntegerUnit,
    integerMin,
    setIntegerMin,
    integerMax,
    setIntegerMax,

    decimalDefault,
    setDecimalDefault,
    decimalUnit,
    setDecimalUnit,
    decimalMin,
    setDecimalMin,
    decimalMax,
    setDecimalMax,

    textType,
    setTextType,
    textValue,
    setTextValue,

    booleanType,
    setBooleanType,

    dropdownMode,
    setDropdownMode,
    dropdownOptions,
    setDropdownOptions,
    selectedDropdownValues,
    setSelectedDropdownValues,

    handleDropdownModeChange,
    handleSave,

    UNIT_OPTIONS,
    FIELD_TYPES,
  };
}
