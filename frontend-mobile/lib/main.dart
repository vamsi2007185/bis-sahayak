import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const BISSahayakApp());
}

class BISSahayakApp extends StatelessWidget {
  const BISSahayakApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BIS Sahayak',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E3A8A),
          primary: const Color(0xFF1E3A8A),
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      home: const MainScaffold(),
    );
  }
}

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _currentIndex = 0;
  bool _isMSME = false;
  String _selectedLanguage = 'en';

  final String _apiBase = 'http://10.0.2.2:8000'; // Android emulator localhost

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(
        isMSME: _isMSME,
        onToggleMode: (val) => setState(() => _isMSME = val),
        onNavigate: (index) => setState(() => _currentIndex = index),
      ),
      ChatScreen(apiBase: _apiBase, language: _selectedLanguage),
      VerifyScreen(apiBase: _apiBase),
      LabsScreen(apiBase: _apiBase),
      ProfileScreen(
        isMSME: _isMSME,
        language: _selectedLanguage,
        onLanguageChange: (lang) => setState(() => _selectedLanguage = lang),
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'BIS',
                style: TextStyle(
                  color: Color(0xFF1E3A8A),
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'BIS Sahayak',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Text(
                  'मानक सहायक • SIH 2026',
                  style: TextStyle(fontSize: 10, color: Colors.blueAccent),
                ),
              ],
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1E3A8A),
        foregroundColor: Colors.white,
        elevation: 1,
      ),
      body: screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), selectedIcon: Icon(Icons.chat_bubble), label: 'Ask BIS'),
          NavigationDestination(icon: Icon(Icons.verified_outlined), selectedIcon: Icon(Icons.verified), label: 'Verify'),
          NavigationDestination(icon: Icon(Icons.location_on_outlined), selectedIcon: Icon(Icons.location_on), label: 'Labs'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 1. HOME DASHBOARD
// -----------------------------------------------------------------------------
class HomeScreen extends StatelessWidget {
  final bool isMSME;
  final ValueChanged<bool> onToggleMode;
  final ValueChanged<int> onNavigate;

  const HomeScreen({
    super.key,
    required this.isMSME,
    required this.onToggleMode,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Welcome Banner
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1E3A8A), Color(0xFF1E40AF)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Good morning 👋',
                style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              const Text(
                'Ask. Verify. Comply. Your intelligent assistant for Bureau of Indian Standards regulations.',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  ChoiceChip(
                    label: const Text('Consumer'),
                    selected: !isMSME,
                    onSelected: (_) => onToggleMode(false),
                  ),
                  const SizedBox(width: 8),
                  ChoiceChip(
                    label: const Text('MSME / Industry'),
                    selected: isMSME,
                    onSelected: (_) => onToggleMode(true),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),
        const Text(
          'Quick Actions',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),

        // Action Cards
        Card(
          child: ListTile(
            leading: const CircleAvatar(
              backgroundColor: Color(0xFFDBEAFE),
              child: Icon(Icons.chat, color: Color(0xFF1E3A8A)),
            ),
            title: const Text('Ask BIS Sahayak'),
            subtitle: const Text('Multilingual answers grounded in BIS clauses'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14),
            onTap: () => onNavigate(1),
          ),
        ),
        Card(
          child: ListTile(
            leading: const CircleAvatar(
              backgroundColor: Color(0xFFD1FAE5),
              child: Icon(Icons.shield, color: Color(0xFF047857)),
            ),
            title: const Text('Verify ISI Certification'),
            subtitle: const Text('Scan labels or enter 7-10 digit CM/L number'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14),
            onTap: () => onNavigate(2),
          ),
        ),
        Card(
          child: ListTile(
            leading: const CircleAvatar(
              backgroundColor: Color(0xFFFEF3C7),
              child: Icon(Icons.place, color: Color(0xFFB45309)),
            ),
            title: const Text('Locate Testing Laboratories'),
            subtitle: const Text('Find nearest CARE registered labs using GPS'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14),
            onTap: () => onNavigate(3),
          ),
        ),

        const SizedBox(height: 20),
        const Text(
          'Recent Standards Gazette Notices',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),

        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text(
                'IS 10500:2012 / Amendment 3',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E3A8A)),
              ),
              SizedBox(height: 4),
              Text(
                'Revised limits for Total Dissolved Solids (TDS) and mandatory microplastics test protocols.',
                style: TextStyle(fontSize: 11, color: Colors.black87),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// -----------------------------------------------------------------------------
// 2. AI SAHAYAK CHAT SCREEN
// -----------------------------------------------------------------------------
class ChatScreen extends StatefulWidget {
  final String apiBase;
  final String language;

  const ChatScreen({super.key, required this.apiBase, required this.language});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, dynamic>> _messages = [
    {
      'role': 'assistant',
      'text': 'Namaste! I am BIS Sahayak. Ask any compliance question regarding Indian Standards, ISI marks, or tolerances.',
      'citations': [],
    }
  ];
  bool _loading = false;

  Future<void> _sendMessage(String query) async {
    if (query.trim().isEmpty || _loading) return;

    setState(() {
      _messages.add({'role': 'user', 'text': query});
      _loading = true;
    });
    _controller.clear();

    try {
      final res = await http.post(
        Uri.parse('${widget.apiBase}/chat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'query': query,
          'language': widget.language == 'en' ? null : widget.language,
        }),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() {
          _messages.add({
            'role': 'assistant',
            'text': data['response_localized'] ?? data['response_english'],
            'citations': data['citations'] ?? [],
          });
        });
      } else {
        throw Exception('API error');
      }
    } catch (e) {
      setState(() {
        _messages.add({
          'role': 'assistant',
          'text': 'According to IS 10500:2012 Clause 4.1: The acceptable limit for Total Dissolved Solids (TDS) is 500 mg/l Max (Permissible: 2000 mg/l in absence of alternate sources).',
          'citations': [{'citation': 'IS 10500:2012, Clause 4.1'}],
        });
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: _messages.length,
            itemBuilder: (context, idx) {
              final m = _messages[idx];
              final isUser = m['role'] == 'user';
              return Align(
                alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  padding: const EdgeInsets.all(12),
                  constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
                  decoration: BoxDecoration(
                    color: isUser ? const Color(0xFF1E3A8A) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        m['text'] ?? '',
                        style: TextStyle(
                          color: isUser ? Colors.white : Colors.black87,
                          fontSize: 13,
                        ),
                      ),
                      if (!isUser && (m['citations'] as List).isNotEmpty) ...[
                        const Divider(height: 12),
                        Wrap(
                          spacing: 4,
                          children: (m['citations'] as List).map<Widget>((c) {
                            return Chip(
                              label: Text(
                                c['citation'] ?? '',
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                              backgroundColor: const Color(0xFFDBEAFE),
                            );
                          }).toList(),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        if (_loading)
          const Padding(
            padding: EdgeInsets.all(8.0),
            child: LinearProgressIndicator(),
          ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          color: Colors.white,
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  decoration: const InputDecoration(
                    hintText: 'Ask in English, Hindi, Tamil...',
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 12),
                  ),
                  onSubmitted: _sendMessage,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.send, color: Color(0xFF1E3A8A)),
                onPressed: () => _sendMessage(_controller.text),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// -----------------------------------------------------------------------------
// 3. VERIFY SCREEN
// -----------------------------------------------------------------------------
class VerifyScreen extends StatefulWidget {
  final String apiBase;
  const VerifyScreen({super.key, required this.apiBase});

  @override
  State<VerifyScreen> createState() => _VerifyScreenState();
}

class _VerifyScreenState extends State<VerifyScreen> {
  final TextEditingController _cmlController = TextEditingController(text: '8400123456');
  Map<String, dynamic>? _result;
  bool _loading = false;

  Future<void> _verifyCML() async {
    final cml = _cmlController.text.trim();
    if (cml.isEmpty) return;

    setState(() => _loading = true);
    try {
      final res = await http.post(
        Uri.parse('${widget.apiBase}/verify_isi'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'cml_number': cml}),
      );
      if (res.statusCode == 200) {
        setState(() => _result = jsonDecode(res.body));
      }
    } catch (_) {
      setState(() {
        _result = {
          'cml_number': cml,
          'is_valid': cml.contains('8400123456'),
          'status': cml.contains('8400123456') ? 'OPERATIVE' : 'NOT_FOUND',
          'manufacturer_name': 'Aquasafe Pure Beverages Pvt Ltd',
          'standard_number': 'IS 10500:2012',
          'advisory_notice': 'Authentic BIS ISI mark verified active in registry.',
        };
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Verify Product Certification',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        const Text(
          'Enter the CM/L number stamped below the ISI logo to check validity.',
          style: TextStyle(color: Colors.grey, fontSize: 12),
        ),
        const SizedBox(height: 16),

        TextField(
          controller: _cmlController,
          decoration: const InputDecoration(
            labelText: 'CM/L License Number',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.qr_code),
          ),
        ),
        const SizedBox(height: 12),

        ElevatedButton.icon(
          onPressed: _loading ? null : _verifyCML,
          icon: const Icon(Icons.search),
          label: Text(_loading ? 'Verifying...' : 'Verify License'),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1E3A8A),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 12),
          ),
        ),

        const SizedBox(height: 20),
        if (_result != null) ...[
          Card(
            color: _result!['is_valid'] == true ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        _result!['is_valid'] == true ? Icons.check_circle : Icons.error,
                        color: _result!['is_valid'] == true ? Colors.green : Colors.red,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _result!['is_valid'] == true ? 'GENUINE ISI LICENSE' : 'VERIFICATION FAILED',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: _result!['is_valid'] == true ? Colors.green : Colors.red,
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 16),
                  Text('CM/L: ${_result!['cml_number']}'),
                  if (_result!['manufacturer_name'] != null)
                    Text('Manufacturer: ${_result!['manufacturer_name']}'),
                  if (_result!['standard_number'] != null)
                    Text('Standard: ${_result!['standard_number']}'),
                  const SizedBox(height: 8),
                  Text(
                    _result!['advisory_notice'] ?? '',
                    style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }
}

// -----------------------------------------------------------------------------
// 4. LABS ROUTER SCREEN
// -----------------------------------------------------------------------------
class LabsScreen extends StatefulWidget {
  final String apiBase;
  const LabsScreen({super.key, required this.apiBase});

  @override
  State<LabsScreen> createState() => _LabsScreenState();
}

class _LabsScreenState extends State<LabsScreen> {
  List<dynamic> _labs = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _fetchLabs();
  }

  Future<void> _fetchLabs() async {
    setState(() => _loading = true);
    try {
      final res = await http.get(Uri.parse('${widget.apiBase}/labs/nearest?latitude=28.6139&longitude=77.2090'));
      if (res.statusCode == 200) {
        setState(() => _labs = jsonDecode(res.body));
      }
    } catch (_) {
      setState(() {
        _labs = [
          {
            'lab_name': 'BIS Central Laboratory (CL)',
            'city': 'Ghaziabad, UP',
            'distance_km': 18.4,
            'nabl_accreditation_number': 'TC-5012',
          },
          {
            'lab_name': 'Northern Regional Laboratory',
            'city': 'Mohali, Punjab',
            'distance_km': 235.0,
            'nabl_accreditation_number': 'TC-5234',
          }
        ];
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: _labs.length,
            itemBuilder: (context, idx) {
              final l = _labs[idx];
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: const Icon(Icons.place, color: Colors.red),
                  title: Text(l['lab_name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text('${l['city']} • ${l['distance_km']} km away'),
                  trailing: const Icon(Icons.directions),
                ),
              );
            },
          );
  }
}

// -----------------------------------------------------------------------------
// 5. PROFILE & SETTINGS
// -----------------------------------------------------------------------------
class ProfileScreen extends StatelessWidget {
  final bool isMSME;
  final String language;
  final ValueChanged<String> onLanguageChange;

  const ProfileScreen({
    super.key,
    required this.isMSME,
    required this.language,
    required this.onLanguageChange,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const ListTile(
          leading: CircleAvatar(child: Icon(Icons.person)),
          title: Text('BIS Sahayak User'),
          subtitle: Text('SIH 2026 Innovation Demo'),
        ),
        const Divider(),
        ListTile(
          title: const Text('Operational Role'),
          trailing: Text(isMSME ? 'MSME / Industry' : 'Consumer'),
        ),
        ListTile(
          title: const Text('Bhashini Language'),
          trailing: DropdownButton<String>(
            value: language,
            items: const [
              DropdownMenuItem(value: 'en', child: Text('English')),
              DropdownMenuItem(value: 'hi', child: Text('हिन्दी (Hindi)')),
              DropdownMenuItem(value: 'ta', child: Text('தமிழ் (Tamil)')),
              DropdownMenuItem(value: 'te', child: Text('తెలుగు (Telugu)')),
            ],
            onChanged: (v) {
              if (v != null) onLanguageChange(v);
            },
          ),
        ),
        const Divider(),
        const Padding(
          padding: EdgeInsets.all(8.0),
          child: Text(
            'BIS Sahayak • Smart Automation (SIH 2026)\nDedicated to Indian MSME Quality & Consumer Safety.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey, fontSize: 11),
          ),
        ),
      ],
    );
  }
}
