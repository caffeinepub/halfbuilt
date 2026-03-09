import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  // Old actor type without currentId.
  type OldActor = {
    projectStore : Map.Map<Nat, { id : Nat; name : Text; description : Text; potentialScore : Float; causeOfDeath : Text; price : Float; category : Text; tags : [Text] }>;
    submissionCount : Nat;
    totalFounderSpots : Nat;
  };

  // New actor type with currentId.
  type NewActor = {
    projectStore : Map.Map<Nat, { id : Nat; name : Text; description : Text; potentialScore : Float; causeOfDeath : Text; price : Float; category : Text; tags : [Text] }>;
    submissionCount : Nat;
    totalFounderSpots : Nat;
    currentId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    { old with currentId = 100 };
  };
};
