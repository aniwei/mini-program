use std::{collections::HashMap, rc::Rc};
use std::result::Result::Ok;
use anyhow::*;
use crate::Asset;

type AssetMap<'a> = HashMap<&'a str, Rc<dyn Asset + 'a>>;

pub struct AssetSet<'a> {
  assets: AssetMap<'a>
}

impl<'a> AssetSet<'a> {
  pub fn new() -> Self {
    Self {
      assets: HashMap::new()
    }
  }

  pub fn add(&mut self, ext: &'a str, asset: Rc<dyn Asset + 'a>) -> Result<bool> {
    if !self.assets.contains_key(ext) {
      return Ok(false)
    }

    self.assets.insert(ext, asset.clone());
    Ok(true)
  }

  pub fn get(&self, name: &str) -> Option<Rc<dyn Asset + 'a>> {
    match self.assets.get(name) {
      Some(asset) => Some(asset.clone()),
      None => None
    }
  }

  pub fn css(&self) -> Option<Rc<dyn Asset + 'a>> {
    self.get("css")
  }

  pub fn less(&self) -> Option<Rc<dyn Asset + 'a>> {
    self.get("less")
  }

  pub fn scss(&self) -> Option<Rc<dyn Asset + 'a>> {
    self.get("scss")
  }

  pub fn xml(&self) -> Option<Rc<dyn Asset + 'a>> {
    self.get("xml")
  }

  pub fn javascript(&self) -> Option<Rc<dyn Asset + 'a>> {
    self.get("js")
  }

  pub fn typescript(&self) -> Option<Rc<dyn Asset + 'a>> {
    self.get("ts")
  }
}