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

#[async_trait]
impl Process<CocoaPodStatus> for Node {

  async fn is_installed () -> Result<bool> {
    Ok(ProcessUtils::exits_happy("which", vec!["pod"]).await?)
  }

  async fn get_version () -> Result<Version> {
    let output = ProcessUtils::run("pod", vec!["--version"], None).await?;
     
    if output.status.success() {
      let stdout = String::from_utf8(output.stdout)?;
      let version = Version::parse(stdout.trim())?;

      Ok(version)
    } else {
      Err(Error::msg("Cannot get cocoapod version."))
    }
  }

  async fn evaluate (&self) -> Result<CocoaPodStatus> {
    let is_installed = CocoaPod::is_installed().await?;

    if !is_installed {
      return Ok(CocoaPodStatus::NotInstalled)
    }

    let version = CocoaPod::get_version()
      .await;

    Ok(match version {
      Ok (version) => {
        let minium_version = &self.minium_version;
        let recommended_version = &self.recommended_version;
          
        if &version < minium_version {
          CocoaPodStatus::BelowMinimumVersion
        } else if &version < recommended_version {
          CocoaPodStatus::BelowRecommendedVersion
        } else {
          CocoaPodStatus::Recommended
        }
      },
      Err (_) => {
        CocoaPodStatus::UnknownVersion
      }
    })
  }
}