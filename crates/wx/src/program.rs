use serde::Deserialize;
use std::{default, fs};
use anyhow::*;
use std::fs::File;
use std::result::Result::Ok;
use std::path::{Path, PathBuf};
use std::sync::Once;

static INIT: Once = Once::new();


/// app.json
#[derive(Default)]
pub struct ProgramSetting {
  pages: Vec<String>,
}

/// 小程序执行环境实例
static mut PROGRAM_INSTANCE: Option<Program> = None;

/// 小程序结构
pub struct Program {
  root: Box<PathBuf>,
  setting: Option<ProgramSetting>
}


impl Program {
  pub fn new (root: &str) -> Self {
    let path = Path::new(root).to_owned();

    Program {
      root: Box::new(path),
      setting: None
    }
  }

  // 单例模式
  pub fn share_instance (root: &str) -> &'static Program {
    unsafe {
      INIT.call_once(|| {
        PROGRAM_INSTANCE = Some(Program::new(root));
      });

      PROGRAM_INSTANCE.as_ref().unwrap()
    }
  }

  pub fn is_exist_wxproj_program(&self) -> Result<bool> {
    if let Ok(is_exist) = self.get_wxproj_program_setting() {
      return Ok(true)
    }

    Ok(false)
  }

  fn get_wxproj_program_setting(&self) -> Result<ProgramSetting> {
    if let Ok(is_exist) = self.is_exist_wxproj_program_setting_file() {
      
    }

    Err(Error::msg("The current path is not a WeChat Miniprogram project."))
  }

  /// 判断是否 存在 app.json
  pub fn is_exist_wxproj_program_setting_file (&self) -> Result<bool> {
    let file_path = Path::join(&self.root, "app.json");
   
    if let Ok(metadata) = fs::metadata(file_path) {
      if metadata.is_file() {
        return Ok(true)
      }
    } 

    Ok(false)
  }
}