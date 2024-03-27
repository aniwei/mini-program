use serde::Deserialize;
use std::io::Read;
use std::{fs};
use anyhow::*;
use std::fs::File;
use std::result::Result::Ok;
use std::path::{Path, PathBuf};
use std::sync::Once;

static INIT: Once = Once::new();


use crate::program::{Program};

/// project.config.json
#[derive(Debug, Deserialize)]
pub struct ProjSetting {
  pub miniprogramRoot: String,
  pub projectname: String,
  pub appid: String
}

/// wx proj
#[derive(Default)]
pub struct Proj<'a> {
  pub root: Box<PathBuf>,
  setting: Option<ProjSetting>,
  program: Option<&'a Program>,
}

/// 
impl Proj<'_> {
  pub fn new (root: Box<PathBuf>) -> Self {
    Self {
      root: root,
      setting: None,
      program: None
    }
  }

  pub fn get_setting(&self) -> Result<&ProjSetting> {
    if let Some(setting) = &self.setting {
      return Ok(setting)
    }

    Err(Error::msg("Proj.setting is not set"))
  }

  pub fn get_program(&self) -> Result<&Program> {
    if let Some(program) = self.program {
      return Ok(program);
    }

    Err(Error::msg("Proj.program is not set"))
  }

  pub fn get_mut_program(&mut self) -> Result<&Program> {
    if let Some(program) = self.program {
      return Ok(program)
    }

    Err(Error::msg("Program is not set"))
  }

  pub fn is_wxproj(&mut self) -> Result<bool> {
    if let Ok(wxproj) = self.get_mut_wxproj() {
      return Ok(true)
    }
    
    Ok(false)
  }

  pub fn get_wxproj(&self) -> Result<&Self> {
    Ok(self)
  }

  pub fn get_mut_wxproj(&mut self) -> Result<&mut Self> {
    self.init_wxproj();
    Ok(self)
  }

  fn init_wxproj(&mut self) {
    INIT.call_once(|| {
      if let Ok(setting) = self.get_wxproj_setting() {
        self.program = Some(Program::share_instance(&setting.miniprogramRoot));
        self.setting = Some(setting);
      }
    });
  }

  /// 读取项目设置
  fn get_wxproj_setting (&self) -> Result<ProjSetting> {
    if let Ok(is_exist) = self.is_exist_wxproj_setting_file() {
      let file_path = Path::join(&self.root, "project.config.json");
      let mut file = File::open(file_path)?;

      let mut contents = String::new();
      file.read_to_string(&mut contents)?;

      let proj_setting: ProjSetting = serde_json::from_str(&contents)?;

      return Ok(proj_setting)
    };

    Ok(ProjSetting {
      miniprogramRoot: self.root.to_string_lossy().into_owned(),
      projectname: String::new(),
      appid: String::new()
    })
  }

  /// 判断是否是 project.config.json 配置项目
  fn is_exist_wxproj_setting_file (&self) -> Result<bool> {
    let file_path = Path::join(&self.root, "project.config.json");

    if let Ok(metadata) = fs::metadata(file_path) {
      if metadata.is_file() {
        return Ok(true)
      }
    } 

    Ok(false)
  }
}
