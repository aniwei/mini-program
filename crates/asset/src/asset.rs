use std::path::{Path, PathBuf};

use tokio::fs;

pub enum AssetStatusKind {
  Created = 1,
  Read = 2,
  Parsed = 4,
  Mounted = 8,
  Error = 16
}

pub struct AssetSource {
  pub base_path: String,
  pub relative_path: String,
  pub absolute_path: PathBuf,
  pub raw: Option<Vec<u8>>,
  pub index: usize,
  pub status: AssetStatusKind
}

impl AssetSource {
  pub fn new(
    relative_path: &str,
    base_path: &str,
    raw: Option<Vec<u8>>,
    index: usize,
  ) -> Self {
    let absolute_path = Path::new(base_path).join(relative_path);

    Self {
      base_path: base_path.to_string(),
      relative_path: relative_path.to_string(),
      absolute_path: absolute_path,
      raw: raw,
      index,
      status: AssetStatusKind::Created
    }
  }

  pub fn get_raw(&self) -> Option<&Vec<u8>> {
    match self.raw.as_ref() {
      Some(raw) => Some(raw),
      None => None
    }
  }

  pub fn get_status(&self) -> &AssetStatusKind {
    &self.status
  }

  pub fn get_index(&self) -> usize {
    self.index
  }

  pub fn get_ext(&self) -> anyhow::Result<&str> {
    if let Some(ext) = self.absolute_path.extension() {
      if let Some(ext) = ext.to_str() {
        return Ok(ext)
      }
    }

    Err(anyhow::Error::msg("Asset must has extension."))
  }

  pub fn get_name(&self) -> anyhow::Result<&str> {
    if let Some(file_name) = self.absolute_path.file_name() {
      if let Some(file_name) = file_name.to_str() {
        return Ok(file_name)
      }
    }

    Err(anyhow::Error::msg("Asset must has file name."))
  }
}


pub enum Asset {
  Localization(AssetSource),
  Remote(AssetSource)
}

impl Asset {
  async fn read (&mut self) -> anyhow::Result<()> {
    match self {
      Self::Localization(source) => {
        Ok(())
      },
      Self::Remote(source) => {
        let raw = fs::read(&source.absolute_path).await?;
        source.raw = Some(raw);
        Ok(())
      }
    }
  }

  async fn write (&mut self) -> anyhow::Result<()> {
    Ok(())
  }
}