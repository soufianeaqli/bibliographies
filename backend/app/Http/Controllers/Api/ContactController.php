<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sujet'  => 'required|string|max:255',
            'message' => 'required|string',
            'type'   => 'required|in:demande_livre,suggestion,probleme,autre',
        ]);

        $contact = Contact::create([
            'utilisateur_id' => Auth::id(),
            'sujet'          => $data['sujet'],
            'message'        => $data['message'],
            'type'           => $data['type'],
        ]);

        return response()->json($contact, 201);
    }

    public function index(): JsonResponse
    {
        $contacts = Contact::with('utilisateur:id,nom,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($contacts);
    }

    public function show(Contact $contact): JsonResponse
    {
        return response()->json($contact->load('utilisateur:id,nom,email'));
    }

    public function markAsRead(Contact $contact): JsonResponse
    {
        $contact->update(['is_read' => true]);
        return response()->json($contact);
    }

    public function reply(Request $request, Contact $contact): JsonResponse
    {
        $data = $request->validate([
            'reponse' => 'required|string',
        ]);

        $contact->update([
            'reponse'  => $data['reponse'],
            'is_read'  => true,
        ]);

        Notification::create([
            'utilisateur_id' => $contact->utilisateur_id,
            'type'           => 'contact_reply',
            'message'        => 'Réponse à votre message « ' . $contact->sujet . ' » : ' . mb_substr($data['reponse'], 0, 200),
        ]);

        return response()->json($contact);
    }

    public function destroy(Contact $contact): JsonResponse
    {
        $contact->delete();
        return response()->json(['message' => 'Message supprimé.']);
    }

    public function mine(): JsonResponse
    {
        $contacts = Contact::where('utilisateur_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($contacts);
    }
}
