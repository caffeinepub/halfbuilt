import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Float "mo:core/Float";



actor {
  type Project = {
    id : Nat;
    name : Text;
    description : Text;
    potentialScore : Float;
    causeOfDeath : Text;
    price : Float;
    category : Text;
    tags : [Text];
  };

  module Project {
    public func compareByPrice(a : Project, b : Project) : Order.Order {
      Float.compare(a.price, b.price);
    };
  };

  let projectStore = Map.empty<Nat, Project>();

  var submissionCount = 0;
  let totalFounderSpots = 100;

  // Store initial projects
  let initialProjects = [
    {
      id = 1;
      name = "Webify";
      description = "A tool to convert websites into desktop apps.";
      potentialScore = 7.5;
      causeOfDeath = "Lack of users";
      price = 199.99;
      category = "Web App";
      tags = ["desktop", "web", "tool"];
    },
    {
      id = 2;
      name = "FitTrack";
      description = "Mobile app for tracking workouts and nutrition.";
      potentialScore = 8.2;
      causeOfDeath = "Lost interest";
      price = 299.99;
      category = "Mobile App";
      tags = ["fitness", "health", "mobile"];
    },
    {
      id = 3;
      name = "CloudSync";
      description = "SaaS for syncing files across devices.";
      potentialScore = 9.0;
      causeOfDeath = "Technical challenges";
      price = 499.99;
      category = "SaaS";
      tags = ["cloud", "sync", "files"];
    },
    {
      id = 4;
      name = "DungeonQuest";
      description = "Turn-based dungeon crawler game.";
      potentialScore = 7.8;
      causeOfDeath = "No funding";
      price = 149.99;
      category = "Game";
      tags = ["game", "dungeon", "turn-based"];
    },
    {
      id = 5;
      name = "ScriptEase";
      description = "Automation tool for repetitive tasks.";
      potentialScore = 8.5;
      causeOfDeath = "Too many competitors";
      price = 299.99;
      category = "Tool";
      tags = ["automation", "tool", "productivity"];
    },
    {
      id = 6;
      name = "WeatherAPI";
      description = "API for accessing weather data.";
      potentialScore = 8.0;
      causeOfDeath = "API changes";
      price = 349.99;
      category = "API";
      tags = ["api", "weather", "data"];
    },
  ];

  for (project in initialProjects.values()) {
    projectStore.add(project.id, project);
  };

  public query ({ caller }) func listProjects() : async [Project] {
    projectStore.values().toArray();
  };

  public query ({ caller }) func getProject(id : Nat) : async Project {
    switch (projectStore.get(id)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) { project };
    };
  };

  public query ({ caller }) func getFounderSpotsRemaining() : async Nat {
    if (submissionCount >= totalFounderSpots) {
      0;
    } else {
      totalFounderSpots - submissionCount;
    };
  };

  public shared ({ caller }) func submitProject(
    name : Text,
    githubUrl : Text,
    abandonmentReason : Text,
    askingPrice : Float,
    isPublic : Bool,
  ) : async Nat {
    if (submissionCount >= totalFounderSpots) {
      Runtime.trap("No more spots available");
    };
    submissionCount += 1;
    totalFounderSpots - submissionCount;
  };

  public type CommunityLinks = {
    discord : Text;
    x : Text;
    reddit : Text;
  };

  public query ({ caller }) func getCommunityLinks() : async CommunityLinks {
    {
      discord = "https://discord.gg/halfbuilt";
      x = "https://x.com/halfbuilt";
      reddit = "https://reddit.com/r/halfbuilt";
    };
  };
};
