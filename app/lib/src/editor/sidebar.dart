import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class Sidebar extends StatelessWidget {
  const Sidebar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12.0),
      width: 320.0,
      color: Colors.white,
      child: Column(
        children: [
          Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "Snapshots",
                  style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                      fontSize:
                          Theme.of(context).textTheme.bodyLarge?.fontSize),
                ),
                TextButton(
                    style:
                        TextButton.styleFrom(backgroundColor: Colors.black12),
                    onPressed: () async {
                      print("CLICK!");
                      FilePickerResult? result =
                          await FilePicker.platform.pickFiles();

                      if (result != null) {
                        File file = File(result.files.single.path!);
                        print('File: ${file.path}');

                        // Now we'd make an HTTP request to API and give it the path.
                        // POST snapshot/import {
                        //  file: file.path
                        // }
                      }
                    },
                    child: const Text(
                      "Import",
                      style: TextStyle(color: Colors.black),
                    ))
              ])
        ],
      ),
    );
  }
}
