pub enum ValidateResultKind {
  Info,
  Success,
  Error
}

pub struct ValidateResult {
  kind: ValidateResultKind,
  message: Box<str>
}

