import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

class EditorSidebarHeader extends StatelessWidget {
  const EditorSidebarHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
        padding: const EdgeInsets.all(8.0),
        decoration: const BoxDecoration(
            border:
                Border(bottom: BorderSide(width: 1, color: Colors.black12))),
        child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Snapshots",
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize:
                          Theme.of(context).textTheme.labelLarge?.fontSize)),
              FilledButton(
                  style: FilledButton.styleFrom(
                    textStyle: const TextStyle(
                        fontSize: 12.0, fontWeight: FontWeight.bold),
                    backgroundColor: Colors.blue,
                    padding: const EdgeInsets.all(8.0),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4.0)),
                  ),
                  onPressed: () async {
                    print("CLICK!");
                    FilePickerResult? result =
                        await FilePicker.platform.pickFiles();

                    if (result != null) {
                      File file = File(result.files.single.path!);
                      print('File: ${file.path}');

                      // TODO: Convert to use new API client
                      var r = await http.post(
                          Uri.parse("http://localhost:3000/snapshots/import"),
                          headers: {"Content-Type": "application/json"},
                          body:
                              jsonEncode(<String, String>{'path': file.path}));

                      print("GOT RESPONSE");
                      print(r.statusCode);
                      print(r.body);
                      print(r.headers);
                    }
                  },
                  child: const Text(
                    "Import",
                  ))
            ]));
  }
}
