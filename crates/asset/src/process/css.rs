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
  }
  
  #[async_trait]
  impl SourceProcess for CSSProcessor {
    fn get_extesions(&self) -> &Vec<&'static str> {
      &self.extensions
    }
  
    async fn process(&self, source: &mut Source) -> Result<()> {
      // 如果已经处理过，则直接返回
      if source.is_processed() {
        return Ok(());
      }

      // 如果已经加载过，则直接返回
      if source.is_loaded() {
        return Ok(());
      }

      let ext = if let Ok(ext) = source.get_extesions() {
        ext
      } else {
        return Err(anyhow!("The source ext cannot be none."));
      };

      let raw = match ext {
        "css" | "wxss" => {
          source.get_raw()
        }
        "scss" => {
          source.get_raw()
        }
        "sass" => {
          let raw = source.get_raw();

          let result = compile_string(
            std::str::from_utf8(raw.as_ref().unwrap())?, 
            Options::default()
          );

          match result {
            Ok(css) => {
              Ok(Some(css.as_bytes().to_vec()))
            }
            Err(err) => {
              return Err(anyhow!(err));
            }
          }
        } 
        "less" => {
          source.get_raw()
        }
        _ => {
          return Err(anyhow!("The source ext is not supported."));
        }
      };

    

      Ok(())
    }
  }
  