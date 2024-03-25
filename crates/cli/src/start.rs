use std::default;
use std::fs::File;
use std::io::prelude::*;
use anyhow::*;

#[derive(Default)]
pub(crate) struct WxStartArgs {
  pub(crate) port: u32,
  pub(crate) root: Box<String>,
}

/// 
impl WxStartArgs {
  fn getWxProj(root: &str) -> Result<WxStartArgs> {
    Err(Error::msg("Unimpl."))
  }
}