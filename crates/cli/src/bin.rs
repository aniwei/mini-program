mod proj;
mod doctor;

use anyhow::*;
use clap::{arg, Parser, Subcommand};
use log::info;
use proj::ProjStartArgs;
use wx::proj::Proj;
use core::result::Result::Ok;

use doctor::*;

/// 命令枚举
#[derive(Subcommand,Debug)]
enum AxCommands {
  Start(AxStartCommand),
  Doctor(AxDoctorCommand)
}

/// 命令行结构
#[derive(Parser, Debug)]
#[command(author="Aniwei", version)]
struct AxCommandArgs {
  #[arg(short, long)]
  version: bool,

  #[arg(long)]
  verbose: bool,

  #[command(subcommand)]
  command: Option<AxCommands>,
}

/// start 命令
#[derive(Parser, Debug)]
struct AxStartCommand {
  #[arg(long)]
  port: Option<u16>,

  #[arg(long)]
  host: Option<String>,

  #[arg(long)]
  root: Option<String>,

  #[arg(long)]
  watch: Option<bool>,
}

/// doctor 命令
#[derive(Parser, Debug)]
struct AxDoctorCommand {}

#[tokio::main]
async fn main() -> Result<()>{
  let args = AxCommandArgs::parse();

  // 初始化日志
  if args.verbose {
    pretty_env_logger::formatted_builder().filter_level(log::LevelFilter::Trace).init();
  }

  // 版本号
  if args.version {
    println!("{}", env!("CARGO_PKG_VERSION"));
    return Ok(());
  }

  // 处理命令
  if let Some(command) = args.command {
    match command {
      AxCommands::Start(AxStartCommand { port, host, root, watch }) => {
        let proj_args = ProjStartArgs::from(AxStartCommand {
          port,
          host,
          root,
          watch
        });

        let mut proj = Proj::new(
          proj_args.root.as_path(), 
          proj_args.port, 
          proj_args.host,
          proj_args.watch
        );

        if let Ok(is_wxproj) = proj.is_wxproj() {
          info!("Starting a WeChat MiniProgram project.");

          match proj.start(Some(Box::new(|| {
            info!("Server started successfully.");
            Ok(())
          }))).await {
            Ok(_) => {
              // Handle successful start
              // GOON
            }
            Err(err) => {
              // Handle error
              // e.g. print error message or return an error
            }
          }
        } else {
          info!("The current path is not a WeChat MiniProgram project.");
        }
      },
      // 处理 Doctor 命令
      AxCommands::Doctor(AxDoctorCommand{}) => {
        print!("Doctor")
      }
    }
  }

  Ok(())
}