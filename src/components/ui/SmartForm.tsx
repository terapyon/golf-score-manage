import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Collapse,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Save as SaveIcon,
  HelpOutline as HelpIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { AutoSaveIndicator, useAutoSave } from './AutoSaveIndicator';

// スマートフォームのプロパティ
interface SmartFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void>;
  steps?: FormStep<T>[];
  enableAutoSave?: boolean;
  autoSaveDelay?: number;
  showProgress?: boolean;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
  children?: React.ReactNode;
}

interface FormStep<T extends FieldValues> {
  label: string;
  description?: string;
  fields: (keyof T)[];
  optional?: boolean;
  component?: React.ComponentType<{ form: UseFormReturn<T> }>;
}

interface SmartFieldProps {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  helperText?: string;
  tooltip?: string;
  validation?: any;
  autoComplete?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  options?: { value: any; label: string }[];
}

// スマートフィールドコンポーネント
export const SmartField: React.FC<SmartFieldProps & { form: UseFormReturn<any> }> = ({
  name,
  label,
  type = 'text',
  required = false,
  helperText,
  tooltip,
  form,
  autoComplete,
  placeholder,
  multiline = false,
  rows = 4,
  disabled = false,
  options = [],
}) => {
  const {
    register,
    formState: { errors, isSubmitting },
    watch,
  } = form;

  const fieldValue = watch(name);
  const error = errors[name];
  const hasError = !!error;

  // フィールドの状態アイコン
  const getStatusIcon = () => {
    if (hasError) {
      return <ErrorIcon color="error" fontSize="small" />;
    }
    if (required && fieldValue) {
      return <CheckIcon color="success" fontSize="small" />;
    }
    return null;
  };

  return (
    <Box position="relative">
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Typography variant="body2" color={hasError ? 'error' : 'text.primary'}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} arrow>
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Box ml="auto">
          <Fade in={!!getStatusIcon()}>
            <Box display="flex" alignItems="center">
              {getStatusIcon()}
            </Box>
          </Fade>
        </Box>
      </Box>

      <TextField
        {...register(name)}
        fullWidth
        type={type}
        placeholder={placeholder}
        error={hasError}
        helperText={error?.message as string || helperText}
        disabled={disabled || isSubmitting}
        autoComplete={autoComplete}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        select={options.length > 0}
        InputLabelProps={{ shrink: true }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-error': {
              '& fieldset': {
                borderColor: 'error.main',
              },
            },
            '&.Mui-focused': {
              '& fieldset': {
                borderColor: hasError ? 'error.main' : 'primary.main',
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </TextField>
    </Box>
  );
};

// メインのスマートフォームコンポーネント
export function SmartForm<T extends FieldValues>({
  form,
  onSubmit,
  steps = [],
  enableAutoSave = false,
  autoSaveDelay = 3000,
  showProgress = false,
  validationMode = 'onChange',
  children,
}: SmartFormProps<T>) {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    trigger,
  } = form;

  // フォームの値を監視
  const formValues = watch();

  // 自動保存の設定
  const autoSaveConfig = useAutoSave(
    formValues,
    async (data: T) => {
      if (enableAutoSave && isDirty) {
        // ドラフト保存のロジック（実装は要件による）
        console.log('Auto-saving draft:', data);
      }
    },
    {
      delay: autoSaveDelay,
      enabled: enableAutoSave && isDirty,
    }
  );

  // 進捗計算
  const calculateProgress = useCallback(() => {
    if (steps.length === 0) return 0;
    
    let completedFields = 0;
    let totalFields = 0;

    steps.forEach((step) => {
      step.fields.forEach((fieldName) => {
        totalFields++;
        const fieldValue = formValues[fieldName];
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          completedFields++;
        }
      });
    });

    return totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  }, [steps, formValues]);

  // ステップの検証
  const validateStep = useCallback(async (stepIndex: number) => {
    if (steps.length === 0) return true;
    
    const step = steps[stepIndex];
    const isValid = await trigger(step.fields as any);
    return isValid;
  }, [steps, trigger]);

  // 次のステップ
  const handleNext = useCallback(async () => {
    const isStepValid = await validateStep(activeStep);
    if (isStepValid && activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  }, [activeStep, steps.length, validateStep]);

  // 前のステップ
  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  }, [activeStep]);

  // フォーム送信
  const handleFormSubmit = useCallback(async (data: T) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'フォームの送信に失敗しました'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl+S で保存
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (enableAutoSave) {
          autoSaveConfig.saveNow();
        }
      }
      
      // Ctrl+Enter で送信
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        handleSubmit(handleFormSubmit)();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [enableAutoSave, autoSaveConfig, handleSubmit, handleFormSubmit]);

  const progress = calculateProgress();
  const isLastStep = activeStep === steps.length - 1;
  const canProceed = Object.keys(errors).length === 0;

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      {/* 自動保存インジケーター */}
      {enableAutoSave && (
        <AutoSaveIndicator status={autoSaveConfig.status} />
      )}

      {/* 進捗バー */}
      {showProgress && (
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              進捗: {Math.round(progress)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {steps.length > 0 && `${activeStep + 1} / ${steps.length}`}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      {/* エラーメッセージ */}
      <Collapse in={!!submitError}>
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      </Collapse>

      {/* ステップ式フォーム */}
      {steps.length > 0 ? (
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
                {step.description && (
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                )}
              </StepLabel>
              <StepContent>
                {step.component ? (
                  <step.component form={form} />
                ) : (
                  <Box py={2}>
                    {/* デフォルトのフィールド表示 */}
                    <Typography variant="body2" color="text.secondary">
                      Step {index + 1} content would go here
                    </Typography>
                  </Box>
                )}
                
                <Box display="flex" gap={2} mt={3}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    startIcon={<BackIcon />}
                  >
                    戻る
                  </Button>
                  
                  {isLastStep ? (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting || !canProceed}
                      startIcon={<SaveIcon />}
                    >
                      {isSubmitting ? '送信中...' : '送信'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!canProceed}
                      endIcon={<NextIcon />}
                    >
                      次へ
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      ) : (
        // 通常のフォーム
        <Box>
          {children}
          
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !canProceed}
              startIcon={<SaveIcon />}
            >
              {isSubmitting ? '送信中...' : '送信'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default SmartForm;