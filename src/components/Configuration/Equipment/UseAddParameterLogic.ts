import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import type { AppDispatch, RootState } from "@/store";
import { fetchClinic } from "@/store/clinicSlice";
import { environmentApi, equipmentApi } from "@/services/api";
import { ParameterContent } from "@/types";

const PARAM_DRAFT_STORAGE_KEY = "equipment_parameters_draft";
const PARAM_MANDATORY_CACHE_KEY = "parameter_mandatory_cache";
const formatDecimal = (value: any) => {
  if (value === null || value === undefined || value === "") return null;

  const str = String(value);

  if (str.includes(".")) return str;

  return `${str}.0`;
};

const resolveMandatoryFlag = (source: any, fallback?: any): boolean => {
  const candidates = [
    source?.mandatory,
    source?.is_mandatory,
    source?.required,
    source?.is_required,
    source?.config?.mandatory,
    source?.config?.is_mandatory,
    source?.config?.required,
    source?.config?.is_required,
    source?.config?.content?.mandatory,
    source?.config?.content?.is_mandatory,
    source?.config?.content?.required,
    source?.config?.content?.is_required,
    source?.config?.Content?.mandatory,
    source?.config?.Content?.is_mandatory,
    source?.config?.Content?.required,
    source?.config?.Content?.is_required,
    fallback?.mandatory,
    fallback?.is_mandatory,
    fallback?.required,
    fallback?.is_required,
    fallback?.content?.mandatory,
    fallback?.content?.is_mandatory,
    fallback?.content?.required,
    fallback?.content?.is_required,
    fallback?.Content?.mandatory,
    fallback?.Content?.is_mandatory,
    fallback?.Content?.required,
    fallback?.Content?.is_required,
  ];

  for (const value of candidates) {
    if (value === true || value === 1 || value === "1" || value === "true") {
      return true;
    }
    if (value === false || value === 0 || value === "0" || value === "false") {
      return false;
    }
  }

  return false;
};

const normalizeDropdownValue = (data: any): string[] => {
  if (Array.isArray(data)) {
    return data.map(String).filter(Boolean);
  }
  if (typeof data === "string" && data.trim()) {
    return data
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

export const useAddParameterLogic = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { rawData: clinic } = useSelector((state: RootState) => state.clinic);

  const entityType: "equipment" | "environment" = location.pathname.includes(
    "/environment",
  )
    ? "environment"
    : "equipment";

  const isEnvironment = entityType === "environment";
  const isEquipment = entityType === "equipment";

  const [equipmentName, setEquipmentName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(
    location.state?.departmentId ? Number(location.state.departmentId) : null,
  );
  const [count, setCount] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [parameters, setParameters] = useState<ParameterContent[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [equipmentTable, setEquipmentTable] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalEquipment, setOriginalEquipment] = useState<any>(null);
  const [nextSrNo, setNextSrNo] = useState(1);
  const [environmentId, setEnvironmentId] = useState<number | null>(null);
  const [paramToEdit, setParamToEdit] = useState<any>(null);
  const [editingParamIndex, setEditingParamIndex] = useState<number | null>(null);
  const [selectedParamCount, setSelectedParamCount] = useState<number>(0);

  const equipmentQuantity = Array.from({ length: count }, (_, i) => i + 1);

  const buildMandatoryParamKey = (param: any): string => {
    if (param?.id != null) return `id:${param.id}`;
    const name = String(
      param?.parameter_name ??
        param?.env_parameter_name ??
        param?.name ??
        param?.title ??
        "",
    )
      .trim()
      .toLowerCase();
    return `name:${name}`;
  };

  const loadMandatoryCache = (): Record<string, Record<string, boolean>> => {
    try {
      const raw = localStorage.getItem(PARAM_MANDATORY_CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const saveMandatoryCacheForEntity = (entityKey: string, params: any[]) => {
    const cache = loadMandatoryCache();
    cache[entityKey] = params.reduce<Record<string, boolean>>((acc, param) => {
      acc[buildMandatoryParamKey(param)] = resolveMandatoryFlag(param);
      return acc;
    }, {});
    localStorage.setItem(PARAM_MANDATORY_CACHE_KEY, JSON.stringify(cache));
  };

  const saveParametersToLocalStorage = (params: any[]) => {
    try {
      localStorage.setItem(PARAM_DRAFT_STORAGE_KEY, JSON.stringify(params));
    } catch (error) {
      console.error("Error saving parameters to localStorage:", error);
    }
  };

  const loadParametersFromLocalStorage = (): any[] => {
    try {
      const storedParams = localStorage.getItem(PARAM_DRAFT_STORAGE_KEY);
      return storedParams ? JSON.parse(storedParams) : [];
    } catch (error) {
      console.error("Error loading parameters from localStorage:", error);
      return [];
    }
  };

  useEffect(() => {
    const equipmentId = location.state?.equipmentId;
    const envId = location.state?.environmentId;

    /* ENVIRONMENT EDIT */
    if (isEnvironment && envId && clinic) {
      const department = clinic.department.find((d) =>
        d.environments?.some((env) => env.id === envId),
      );

      const environment = department?.environments?.find(
        (env) => env.id === envId,
      );

      if (!environment || !department) return;

      setEnvironmentId(environment.id);
      setIsEditMode(true);
      setEquipmentName(environment.environment_name);
      setDepartmentName(department.name);
      setDepartmentId(department.id);

      const mandatoryCache = loadMandatoryCache();
      const entityMandatoryCache = mandatoryCache[`environment:${envId}`] ?? {};

      const loadedParams = environment.parameters.map((p: any) => {
        let cfg = p.config || {};
        if (cfg.history?.length) {
          cfg = cfg.history[cfg.history.length - 1];
        }

        return {
          id: p.id,
          name: p.env_parameter_name,
          title: p.env_parameter_name,
          data_type: cfg.data_type,
          field_type: cfg.data_type,
          mandatory:
            entityMandatoryCache[buildMandatoryParamKey(p)] ??
            resolveMandatoryFlag(p, cfg),
          default_value: cfg.default_value ?? "",
          unit: cfg.unit ?? "",
          min_value: cfg.min_value ?? "",
          max_value: cfg.max_value ?? "",
          text: cfg.text ?? "",
          text_type: cfg.text_type ?? "single",
          boolean_type: cfg.boolean_type ?? "yesno",
          dropdown: normalizeDropdownValue(cfg.dropdown),
          selection_type: cfg.selection_type ?? "single",
          percentage: cfg.percentage ?? null,
          is_active: p.is_active,
        };
      });

      setParameters(loadedParams);
      return;
    }

    /* EQUIPMENT EDIT */
    const storeEquipment = clinic?.department
      .flatMap((d) => d.equipments)
      .find((e) => e.id === equipmentId);

    if (storeEquipment) {
      setIsEditMode(true);
      setOriginalEquipment(storeEquipment);
      setEquipmentName(storeEquipment.equipment_name || "");

      const dept = clinic?.department.find((d) =>
        d.equipments.some((e) => e.id === storeEquipment.id),
      );

      setDepartmentName(dept?.name || "");
      setDepartmentId(dept?.id || null);

      const mandatoryCache = loadMandatoryCache();
      const entityMandatoryCache =
        mandatoryCache[`equipment:${storeEquipment.id}`] ?? {};

      const loadedEquipmentTable = (storeEquipment.equipment_details || []).map(
        (detail: any, index: number) => {
          const numMatch = detail.equipment_num?.match(/-(\d+)$/);
          const srNo = numMatch ? parseInt(numMatch[1]) : index + 1;

          return {
            id: detail.id,
            sr: srNo,
            equipmentNum: srNo,
            make: detail.make || "",
            model: detail.model || "",
            // ✅ FIX: use parameter_count from backend if available, else null
            // activeParamCount doesn't exist here — null is correct fallback
            parameterCount: detail.parameter_count ?? null,
          };
        },
      );

      setEquipmentTable(loadedEquipmentTable);

      if (loadedEquipmentTable.length > 0) {
        const maxSrNo = Math.max(...loadedEquipmentTable.map((i: any) => i.sr));
        setCount(maxSrNo);
        setNextSrNo(maxSrNo + 1);
      }

      const loadedParams = storeEquipment.parameters
        .filter((p: any) => !(p.is_deleted === true && p.is_active !== false))
        .map((p: any) => {
          let cfg = p.config || {};
          if (cfg.history?.length) {
            cfg = cfg.history[cfg.history.length - 1];
          }

          const param: any = {
            id: p.id,
            name: p.parameter_name,
            title: p.parameter_name,
            data_type: cfg.data_type,
            field_type: cfg.data_type,
            mandatory:
              entityMandatoryCache[buildMandatoryParamKey(p)] ??
              resolveMandatoryFlag(p, cfg),
          };

          switch (cfg.data_type) {
            case "Integer":
              param.default_value = cfg.default_value || cfg.integer_value || "";
              param.integer_value = cfg.integer_value || "";
              param.unit = cfg.unit || "";
              param.min_value = cfg.min_value || "";
              param.max_value = cfg.max_value || "";
              break;
            case "Decimal":
              param.default_value = formatDecimal(cfg.default_value) || "";
              param.unit = cfg.unit || "";
              param.min_value = formatDecimal(cfg.min_value) || "";
              param.max_value = formatDecimal(cfg.max_value) || "";
              break;
            case "Text":
              param.text_type = cfg.text_type || "single";
              param.text = cfg.text || "";
              break;
            case "Boolean":
              param.boolean_type = cfg.boolean_type || "yesno";
              break;
            case "Dropdown":
              param.dropdown = normalizeDropdownValue(cfg.dropdown);
              param.selection_type = cfg.selection_type || "single";
              break;
          }

          param.percentage = cfg.percentage || null;
          param.is_active = p.is_active;
          return param;
        });

      setParameters(loadedParams);
      localStorage.removeItem(PARAM_DRAFT_STORAGE_KEY);
      return;
    }

    /* ADD MODE */
    setIsEditMode(false);

    if (isEquipment) {
      setEquipmentName(location.state?.equipmentName || "");
    }

    if (isEnvironment) {
      setEquipmentName(
        location.state?.environmentName || "Environment Details",
      );
    }

    setDepartmentName(location.state?.departmentName || "");

    const navDeptId = location.state?.departmentId;
    if (navDeptId) {
      setDepartmentId(navDeptId);
    } else {
      const dept = clinic?.department.find(
        (d) =>
          d.name.toLowerCase() ===
          location.state?.departmentName?.toLowerCase(),
      );
      setDepartmentId(dept?.id || null);
    }

    setParameters(loadParametersFromLocalStorage());
  }, [location, clinic]);

  // Sync environment parameters
  useEffect(() => {
    if (!isEnvironment || !environmentId || !clinic) return;

    const department = clinic.department.find((d) =>
      d.environments?.some((env) => env.id === environmentId),
    );

    const environment = department?.environments?.find(
      (env) => env.id === environmentId,
    );

    if (!environment) return;

    const syncedParams = environment.parameters.map((p: any) => {
      let cfg = p.config || {};
      if (cfg.history?.length) {
        cfg = cfg.history[cfg.history.length - 1];
      }

      return {
        id: p.id,
        name: p.env_parameter_name,
        title: p.env_parameter_name,
        data_type: cfg.data_type,
        field_type: cfg.data_type,
        mandatory: resolveMandatoryFlag(p, cfg),
        default_value: cfg.default_value ?? "",
        unit: cfg.unit ?? "",
        min_value: cfg.min_value ?? "",
        max_value: cfg.max_value ?? "",
        text: cfg.text ?? "",
        text_type: cfg.text_type ?? "single",
        boolean_type: cfg.boolean_type ?? "yesno",
        dropdown: normalizeDropdownValue(cfg.dropdown),
        selection_type: cfg.selection_type ?? "single",
        percentage: cfg.percentage ?? null,
        is_active: p.is_active,
      };
    });

    setParameters(syncedParams);
  }, [clinic, environmentId, isEnvironment]);

  // Auto-save parameters to localStorage
  useEffect(() => {
    if (!isEditMode) {
      saveParametersToLocalStorage(parameters);
    }
  }, [parameters, isEditMode]);

  // Handle equipment quantity changes
  useEffect(() => {
    if (isEditMode) return;

    if (count < equipmentTable.length) {
      setEquipmentTable((prev) => prev.filter((r) => r.equipmentNum <= count));
      setSelected((prev) => prev.filter((n) => n <= count));
    }
  }, [count, isEditMode]);

  // Update make/model when selection changes
  useEffect(() => {
    if (selected.length === 0) {
      setMake("");
      setModel("");
      return;
    }
    const selectedRows = equipmentTable.filter((row) =>
      selected.includes(row.equipmentNum),
    );
    if (selectedRows.length === 0) {
      setMake("");
      setModel("");
      return;
    }
    const firstMake = selectedRows[0]?.make || "";
    const firstModel = selectedRows[0]?.model || "";
    const sameMake = selectedRows.every((row) => (row.make || "") === firstMake);
    const sameModel = selectedRows.every((row) => (row.model || "") === firstModel);
    setMake(sameMake ? firstMake : "");
    setModel(sameModel ? firstModel : "");
  }, [selected, equipmentTable]);

  const toggleSelection = (num: number) => {
    setSelected((prev) =>
      prev.includes(num) ? prev.filter((i) => i !== num) : [...prev, num],
    );
  };

  const handleAddParameter = (data: any) => {
    const paramWithStatus = {
      ...data,
      default_value: data.default_value ?? null,
      is_active: data.is_active ?? true,
    };

    if (editingParamIndex !== null) {
      setParameters((prev) =>
        prev.map((p, i) => (i === editingParamIndex ? paramWithStatus : p)),
      );
      setEditingParamIndex(null);
      setParamToEdit(null);
      toast.success("Parameter updated!");
    } else {
      setParameters((prev) => [...prev, paramWithStatus]);
      toast.success("Parameter added!");
    }
  };

  const handleEditParameter = (menuParamIndex: number) => {
    const param = parameters[menuParamIndex];

    const paramToEditData = {
      id: param.id,
      name: param.name || param.title,
      title: param.title || param.name,
      mandatory: resolveMandatoryFlag(param),
      field_type: param.field_type || param.data_type,
      data_type: param.data_type || param.field_type,
      default_value: param.default_value ?? param.integer_value ?? "",
      unit: param.unit || "",
      min_value: param.min_value ?? "",
      max_value: param.max_value ?? "",
      integer_value: param.integer_value ?? "",
      text_type: param.text_type || "single",
      text: param.text || "",
      boolean_type: param.boolean_type || "yesno",
      dropdown: param.dropdown || [],
      selection_type: param.selection_type || "single",
      percentage: param.percentage || null,
    };

    setParamToEdit(paramToEditData);
    setEditingParamIndex(menuParamIndex);
    return paramToEditData;
  };

  const confirmDeleteParameter = async (paramIndexToDelete: number) => {
    const param = parameters[paramIndexToDelete];

    const updatedParams = parameters.filter((_, i) => i !== paramIndexToDelete);

    try {
      if (param.id) {
        if (isEnvironment) {
          await environmentApi.softDeleteParameter(param.id);
        } else {
          await equipmentApi.softDeleteParameter(param.id);
        }
      }

      setParameters(updatedParams);
      toast.success("Parameter deleted");
      dispatch(fetchClinic(1));
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed");
      setParameters(updatedParams);
    }
  };

  const handleSaveEquipmentDetails = () => {
    if (!make.trim() || !model.trim()) {
      toast.error("Please enter both Make and Model!");
      return;
    }

    // ✅ use selectedParamCount (checked params) if set, else fall back to active params
    const paramCount =
      selectedParamCount > 0
        ? selectedParamCount
        : parameters.filter((p: any) => p.is_active !== false).length;

    setEquipmentTable((prev) => {
      let updated = [...prev];
      let nextSr = nextSrNo;
      selected.forEach((num) => {
        const index = updated.findIndex((row) => row.equipmentNum === num);
        if (index >= 0) {
          updated[index] = {
            ...updated[index],
            make,
            model,
            parameterCount: paramCount,
          };
        } else {
          updated.push({
            sr: nextSr,
            equipmentNum: num,
            make,
            model,
            parameterCount: paramCount,
          });
          nextSr++;
        }
      });
      setNextSrNo(nextSr);
      return updated;
    });

    toast.success("Equipment details updated!", {
      position: "top-right",
      autoClose: 1500,
      theme: "colored",
    });

    setMake("");
    setModel("");
    setSelected([]);
  };

  const handleClearAll = () => {
    setSelected([]);
    setCount(1);
    setMake("");
    setModel("");
    setEquipmentTable([]);
    setParameters([]);
    setNextSrNo(1);
    localStorage.removeItem(PARAM_DRAFT_STORAGE_KEY);
    toast.warn("All data cleared");
  };

  const handleFinalSave = async () => {
    if (isEnvironment && !equipmentName.trim()) {
      toast.error("Environment name is missing");
      return;
    }

    if (parameters.length === 0) {
      toast.error("Please add at least one parameter");
      return;
    }

    if (isEquipment && equipmentTable.length === 0) {
      toast.error("Please add equipment details (Make and Model)");
      return;
    }

    if (isEquipment) {
      const filledRows = equipmentTable.filter(
        (row) => row.make?.trim() && row.model?.trim(),
      );
      if (filledRows.length === 0) {
        toast.error(
          "Please fill Make and Model for at least one equipment unit",
        );
        return;
      }
    }

    if (!departmentId) {
      toast.error("Department not found");
      return;
    }

    try {
      /* EQUIPMENT */
      if (isEquipment) {
        const toMandatoryPayload = (p: any) => {
          const isMandatory = resolveMandatoryFlag(p);
          return {
            mandatory: isMandatory,
            is_mandatory: isMandatory,
            required: isMandatory,
            is_required: isMandatory,
          };
        };

        const equipmentPayload = {
          equipment_name: equipmentName,
          is_active: true,
          equipment_details: equipmentTable
            .filter((row) => row.make?.trim() && row.model?.trim())
            .map((row) => ({
              id: row.id ?? undefined,
              equipment_num: `${equipmentName}-${row.equipmentNum}`,
              make: row.make.trim(),
              model: row.model.trim(),
              // ✅ send parameter_count to backend
              parameter_count: row.parameterCount ?? null,
              is_active: true,
            })),
          parameters: parameters.map((p) => ({
            id: p.id ?? undefined,
            parameter_name: p.name || p.title || "",
            is_active: p.is_active !== false,
            ...toMandatoryPayload(p),
            config: {
              data_type: p.data_type || p.field_type || "",
              ...toMandatoryPayload(p),
              content: {
                ...toMandatoryPayload(p),
              },
              default_value:
                p.data_type === "Integer"
                  ? (p.default_value ?? p.integer_value ?? null)
                  : p.data_type === "Decimal"
                    ? formatDecimal(p.default_value)
                    : p.data_type === "Text"
                      ? (p.text ?? null)
                      : null,
              min_value:
                p.data_type === "Decimal"
                  ? formatDecimal(p.min_value)
                  : (p.min_value ?? null),
              max_value:
                p.data_type === "Decimal"
                  ? formatDecimal(p.max_value)
                  : (p.max_value ?? null),
              integer_value: p.integer_value ?? null,
              unit: p.unit ?? null,
              percentage: p.percentage ?? null,
              text: p.text ?? null,
              text_type: p.text_type ?? null,
              boolean_type: p.boolean_type ?? null,
              dropdown: p.dropdown ?? [],
              selection_type: p.selection_type ?? null,
            },
          })),
        };

        if (isEditMode && originalEquipment?.id) {
          await equipmentApi.update(
            departmentId,
            originalEquipment.id,
            equipmentPayload,
          );
          saveMandatoryCacheForEntity(
            `equipment:${originalEquipment.id}`,
            parameters,
          );
          toast.success("Equipment updated successfully!");
        } else {
          await equipmentApi.create(departmentId, equipmentPayload);
          toast.success("Equipment created successfully!");
        }
      }

      /* ENVIRONMENT */
      if (isEnvironment) {
        const toMandatoryPayload = (p: any) => {
          const isMandatory = resolveMandatoryFlag(p);
          return {
            mandatory: isMandatory,
            is_mandatory: isMandatory,
            required: isMandatory,
            is_required: isMandatory,
          };
        };

        const environmentPayload = {
          environment_name: equipmentName.trim(),
          is_active: true,
          parameters: parameters.map((p) => ({
            id: p.id ?? undefined,
            env_parameter_name: p.name || p.title || "",
            is_active: p.is_active !== false,
            ...toMandatoryPayload(p),
            config: {
              ...toMandatoryPayload(p),
              content: {
                ...toMandatoryPayload(p),
              },
              default_value:
                p.data_type === "Decimal"
                  ? formatDecimal(p.default_value)
                  : (p.default_value ?? null),
              data_type: p.data_type || p.field_type || "",
              min_value:
                p.data_type === "Decimal"
                  ? formatDecimal(p.min_value)
                  : (p.min_value ?? null),
              max_value:
                p.data_type === "Decimal"
                  ? formatDecimal(p.max_value)
                  : (p.max_value ?? null),
              unit: p.unit ?? null,
              percentage: p.percentage ?? null,
              text: p.text ?? null,
              text_type: p.text_type ?? null,
              boolean_type: p.boolean_type ?? null,
              dropdown: p.dropdown ?? [],
              selection_type: p.selection_type ?? null,
            },
          })),
        };

        if (isEditMode && environmentId) {
          await environmentApi.update(environmentId, environmentPayload);
          saveMandatoryCacheForEntity(
            `environment:${environmentId}`,
            parameters,
          );
          toast.success("Environment updated successfully!");
        } else {
          await environmentApi.create(departmentId, environmentPayload);
          toast.success("Environment created successfully!");
        }
      }

      localStorage.removeItem(PARAM_DRAFT_STORAGE_KEY);
      dispatch(fetchClinic(1));

      setTimeout(() => {
        navigate(
          isEnvironment
            ? "/configuration/environment"
            : "/configuration/equipment",
          { replace: true },
        );
      }, 1500);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Save failed! Please check console.");
    }
  };

  const handleParameterStatusChange = async (
    paramIndex: number,
    newStatus: boolean,
  ) => {
    const param = parameters[paramIndex];
    if (!param?.id) return;

    try {
      if (isEnvironment) {
        await environmentApi.updateParameterStatus(param.id, newStatus);
      } else {
        if (newStatus) {
          await equipmentApi.activateParameter(param.id);
        } else {
          await equipmentApi.inactivateParameter(param.id);
        }
      }

      setParameters((prev) => {
        const updated = prev.map((p, i) =>
          i === paramIndex ? { ...p, is_active: newStatus } : p,
        );
        return updated;
      });

      toast.success(`Parameter ${newStatus ? "Activated" : "Inactivated"}`);

      setTimeout(() => {
        dispatch(fetchClinic(1));
      }, 500);
    } catch (e) {
      console.error("Parameter status update failed:", e);
      toast.error("Status update failed");
    }
  };

  return {
    entityType,
    isEnvironment,
    isEquipment,
    equipmentName,
    setEquipmentName,
    departmentName,
    setDepartmentName,
    departmentId,
    count,
    setCount,
    selected,
    toggleSelection,
    parameters,
    setParameters,
    make,
    setMake,
    model,
    setModel,
    equipmentTable,
    setEquipmentTable,
    isEditMode,
    environmentId,
    nextSrNo,
    editingParamIndex,
    paramToEdit,
    setParamToEdit,
    setEditingParamIndex,
    equipmentQuantity,
    normalizeDropdownValue,
    selectedParamCount,
    setSelectedParamCount,
    handleAddParameter,
    handleEditParameter,
    handleDeleteParameter: confirmDeleteParameter,
    handleSaveEquipmentDetails,
    handleClearAll,
    handleFinalSave,
    handleParameterStatusChange,
    navigate,
    location,
  };
};

export default useAddParameterLogic;