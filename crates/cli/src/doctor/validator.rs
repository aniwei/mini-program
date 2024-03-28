enum ValidateResultKind {
  Info,
  Success,
  Error
}

struct ValidateResult {
  kind: ValidateResultKind,
  message: Box<str>
}

