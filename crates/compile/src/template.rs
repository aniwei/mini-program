use std::{path::{Path, PathBuf}, vec};

use mustache::*;
use anyhow::*;
use tokio::fs::read;

use crate::element::Element;


pub trait TemplateRender {
  type T;

  fn render(&self, data: Option<Self::T>) -> anyhow::Result<String>;
}

pub trait TemplateParse {
  type T;
  async fn parse(&mut self) -> anyhow::Result<()>;
}

pub struct TemplateSource {
  pub index: usize,
  pub path: PathBuf,
  pub raw: Option<Vec<u8>>,
}

impl TemplateSource {
  pub fn new(index: usize, path: PathBuf) -> Self {
    Self {
      index,
      path,
      raw: None,
    }
  }

  pub async fn load(&mut self) -> anyhow::Result<()> {
    let raw = read(&self.path).await?;
    self.raw = Some(raw);
    Ok(())
  }
}

impl From<&Path> for TemplateSource {
  fn from(path: &Path) -> Self {
    Self::new(0, path.to_path_buf())
  }
}


pub enum Template {
  XML {
    source: TemplateSource,
    ast: Option<Element>,
    template: Option<mustache::Template>,
  },
  XS {
    source: TemplateSource,
  },
  CSS {
    source: TemplateSource,
  }
}

impl Template {
  
}

impl From<TemplateSource> for Template {
  fn from(source: TemplateSource) -> Self {
    match source.path.extension().unwrap().to_str().unwrap() {
      "xml" => {
        Self::XML {
          source,
          ast: None,
          template: None,
        }
      },
      "xs" => {
        Self::XS {
          source,
        }
      },
      "css" => {
        Self::CSS {
          source,
        }
      },
      _ => {
        panic!("Unsupported template type");
      }
    }
  }
}

impl TemplateRender for Template {
  type T = MapBuilder;

  fn render(&self, data: Option<&mut Self::T>) -> anyhow::Result<String> {
    match self {
      Template::XML { template, .. } => {
        let mut data = data.clone();
        data.push(("index", "0".to_string()));
        let data = data.iter().map(|(k, v)| (k.as_ref(), v.as_str())).collect::<Vec<_>>();
        let rendered = template.as_ref().unwrap().render_data_to_string(&data)?;
        Ok(rendered)
      },
      _ => {
        Ok("".to_string())
      }
    }
  }
}