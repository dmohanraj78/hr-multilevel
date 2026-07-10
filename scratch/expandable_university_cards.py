import os

portals = ['master-portal', 'recruiter-portal']

for portal in portals:
    app_path = os.path.join(portal, 'src', 'App.jsx')
    if os.path.exists(app_path):
        with open(app_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add showAllUnis state
        state_target = "  const [univSearch, setUnivSearch] = useState('');"
        state_repl = "  const [univSearch, setUnivSearch] = useState('');\n  const [showAllUnis, setShowAllUnis] = useState(false);"
        
        if "showAllUnis" not in content:
            content = content.replace(state_target, state_repl)
        
        # Modify the card slice mapping and add button
        # Let's search for "uniDataList.slice(0, 4).map((uni)"
        old_slice_block = "uniDataList.slice(0, 4).map((uni) => {"
        new_slice_block = "(showAllUnis ? uniDataList : uniDataList.slice(0, 4)).map((uni) => {"
        
        content = content.replace(old_slice_block, new_slice_block)

        # Add toggle button after the grid closed div
        # Let's find:
        #                   </div>
        #                 </div>
        #               )
        #             )}
        # Wait, in master-portal App.jsx, the grid ends and then is followed by the Workload Status snapshots title.
        # Let's look at the structure:
        #                   </div>
        #                 </div>
        # Or let's just insert the button immediately after the closing tag of the grid:
        # `                  </div>` (which holds the grid of cards)
        # We can target:
        # ```
        #                           </Card>
        #                         );
        #                       })
        #                     )}
        #                   </div>
        # ```
        # and replace it with the button inserted.
        
        target_grid_end = """                          </Card>
                        );
                      })
                    )}
                  </div>"""

        replacement_grid_end = """                          </Card>
                        );
                      })
                    )}
                  </div>

                  {uniDataList.length > 4 && (
                    <div className="flex justify-center mt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllUnis(!showAllUnis)}
                        className="rounded-xl border-[#800020] text-[#800020] hover:bg-[#800020]/10 font-bold px-6 py-2"
                      >
                        {showAllUnis ? "View Less Universities" : `View More Universities (${uniDataList.length - 4} more)`}
                      </Button>
                    </div>
                  )}"""

        content = content.replace(target_grid_end, replacement_grid_end)

        with open(app_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Added View More / View Less expansion to {app_path}")
