pub mod utils;
pub mod validator;

use anyhow::*;

use self::validator::ValidateResult;

/// doctor 
pub struct Doctor {

}

impl Doctor {
  pub fn new () -> Self {
    return Doctor {}
  }

  pub fn validate () -> Result<Vec<ValidateResult>> {
    let mut results = vec![];

    return Ok(results)
  }
}


