import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

class SidebarHeader extends StatelessWidget {
  const SidebarHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            "Snapshots",
            style: TextStyle(
                color: Colors.black,
                fontWeight: FontWeight.bold,
                fontSize: Theme.of(context).textTheme.bodyLarge?.fontSize),
          ),
          TextButton(
              style: TextButton.styleFrom(backgroundColor: Colors.black12),
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
                      body: jsonEncode(<String, String>{'path': file.path}));

                  print("GOT RESPONSE");
                  print(r.statusCode);
                  print(r.body);
                  print(r.headers);
                }
              },
              child: const Text(
                "Import",
                style: TextStyle(color: Colors.black),
              ))
        ]);
  }
}
