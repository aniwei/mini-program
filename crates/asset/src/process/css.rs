use async_trait::async_trait;
use std::result::{self, Result::Ok};
use sass_rs::*;
use anyhow::*;

use crate::{process::SourceProcess, Source};

/// CSS 处理器
pub struct CSSProcessor {
  pub extensions: Vec<&'static str>
}
  
impl CSSProcessor {
  pub fn new() -> Self {
    Self {
      extensions: vec![
        "css",
        "wxss",
        "scss",
        "sass",
        "less",
      ]
    }
  }

  pub fn parse(&mut self) {

  }

  pub fn sass_transform(&self, source: &mut Source<&str>) -> Result<()> {
    let raw = source.get_raw();
    let result = compile_string(
      std::str::from_utf8(raw.as_ref().unwrap())?, 
      Options::default()
    );

    match result {
      Ok(css) => {
        source.set_transformed(Some(css.as_bytes().to_vec()));
      }
      Err(err) => {
        return Err(anyhow!(err));
      }
    }

    Ok(())
  }

  pub fn less_transform(&self, source: &mut Source<&str>) -> Result<()> {
    let raw = source.get_raw();
    let result = compile_string(
      std::str::from_utf8(raw.as_ref().unwrap())?, 
      Options::default()
    );

    match result {
      Ok(css) => {
        source.set_transformed(Some(css.as_bytes().to_vec()));
      }
      Err(err) => {
        return Err(anyhow!(err));
      }
    }

    Ok(())
  }
}

#[async_trait]
impl SourceProcess for CSSProcessor {
  fn get_extesions(&self) -> &Vec<&'static str> {
    &self.extensions
  }

  async fn process<T>(&self, source: &mut Source<T>) -> Result<()> {
    // 如果已经处理过，则直接返回
    if source.is_processed() {
      return Ok(());
    }

    // 如果已经转换过，则直接返回
    if source.is_transformed() {
      self.parse();
      return Ok(());
    }

    // 转换逻辑
    // 获取扩展名
    let ext = if let Ok(ext) = source.get_extesions() {
      ext
    } else {
      return Err(anyhow!("The source ext cannot be none."));
    };

    match ext {
      "css" | "wxss" => {
        self.set_transformed_raw(source.get_raw().unwrap().clone());
      }
      "scss" | "sass" => {
        self.sass_transform(source);
      }
      "less" => {
        self.less_transform(source);
      }
      _ => {
        return Err(anyhow!("The source ext is not supported."));
      }
    };
  
    self.process(source);

    Ok(())
  }
}
