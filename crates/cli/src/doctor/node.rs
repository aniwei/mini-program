pub struct Node {
  minium_version: Version,
  recommended_version: Version
}

impl Node {
  pub fn new (minium_version: &str, recommended_version: &str) -> Node {
    Node {
      minium_version: Version::parse(minium_version).unwrap(),
      recommended_version: Version::parse(recommended_version).unwrap()
    }
  }
}