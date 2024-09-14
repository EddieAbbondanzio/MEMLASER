import { DataSource } from "typeorm";

export async function processGraph(db: DataSource): Promise<void> {
  // TODO: Calculate retained size and distance from root.
  //
  // How to iterate graph?
  // - We need to handle circular references
  // - Can be large number of nodes (ex 100k+) so speed is important
  // 
  // Algorithm:
  // Start at root and begin visiting children depth first. On first visit to node
  // we mark it as 1, and then visit it's all of it's children in the same manner.
  // When we hit a leaf, we mark it as 2 and start to go back up through visit history
  // each node we hit is a 2 and we set retained size.
  //
  // When visiting nodes if we set it has a 1 already then it has been visited and can
  // be ignored.
}
