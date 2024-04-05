use std::path::{Path, PathBuf};


pub enum AssetStatus {
  Created,
  Mounted,
  Compiled,
  Error
}

pub struct Asset {
  pub base_path: String,
  pub relative_path: String,
  pub absolute_path: PathBuf,
  pub raw: Option<Vec<u8>>,
  pub status: AssetStatus
}


impl Asset {
  pub fn new(
    relative_path: &str,
    base_path: &str,
    raw: Option<Vec<u8>>
  ) -> Self {
    let absolute_path = Path::new(base_path).join(relative_path);

    Self {
      base_path: base_path.to_string(),
      relative_path: relative_path.to_string(),
      absolute_path: absolute_path,
      raw: raw,
      status: AssetStatus::Created
    }
  }

  pub fn get_ext(&self) -> &str {
    self.absolute_path.extension().unwrap().to_str().unwrap()
  }

  pub fn get_name(&self) -> &str {
    self.absolute_path.file_name().unwrap().to_str().unwrap()
  }
}

