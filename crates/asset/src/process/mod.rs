use async_trait::async_trait;
use anyhow::*;

use crate::Source;

mod manager;
mod css;
mod image;
mod xml;
mod json;

pub use manager::*;

#[async_trait]
pub trait SourceProcess {
  fn get_extesions(&self) -> &Vec<&'static str>;
  async fn process(&self, asset: &mut Source<T>) -> Result<()>;
}
