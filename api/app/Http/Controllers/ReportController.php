<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\UserBuild;
use App\Models\Guide;
use App\Models\GuildPost;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /**
     * Get all reports (Admin only)
     */
    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = Report::with(['reporter', 'reviewer'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $reports = $query->paginate(20);

        // Add reportable info
        $reports->getCollection()->transform(function ($report) {
            $report->reportable_info = $this->getReportableInfo($report);
            return $report;
        });

        return response()->json($reports);
    }

    /**
     * Create a new report
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reportable_type' => 'required|in:build,guide,guild_post,comment',
            'reportable_id' => 'required|integer',
            'reason' => 'required|string|max:1000',
        ]);

        // Map type to model class
        $typeMap = [
            'build' => UserBuild::class,
            'guide' => Guide::class,
            'guild_post' => GuildPost::class,
            'comment' => Comment::class,
        ];

        $modelClass = $typeMap[$validated['reportable_type']];

        // Verify the reportable exists
        if (!$modelClass::find($validated['reportable_id'])) {
            return response()->json(['error' => 'Content not found'], 404);
        }

        $report = Report::create([
            'reporter_id' => $request->user()->id,
            'reportable_type' => $modelClass,
            'reportable_id' => $validated['reportable_id'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Report submitted successfully',
            'report' => $report,
        ], 201);
    }

    /**
     * Update report status (Admin only)
     */
    public function update(Request $request, Report $report): JsonResponse
    {
        if (!$request->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,reviewed,resolved,dismissed',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $report->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json($report);
    }

    /**
     * Get reportable info for display
     */
    private function getReportableInfo(Report $report): array
    {
        $reportable = null;
        $link = '';
        $title = '';

        switch ($report->reportable_type) {
            case UserBuild::class:
                $reportable = UserBuild::with('hero')->find($report->reportable_id);
                if ($reportable) {
                    $title = $reportable->title;
                    $link = "/builds/{$reportable->id}";
                }
                break;
            case Guide::class:
                $reportable = Guide::find($report->reportable_id);
                if ($reportable) {
                    $title = $reportable->title;
                    $link = "/guides/{$reportable->slug}";
                }
                break;
            case GuildPost::class:
                $reportable = GuildPost::find($report->reportable_id);
                if ($reportable) {
                    $title = $reportable->title;
                    $link = "/guilds/{$reportable->slug}";
                }
                break;
            case Comment::class:
                $reportable = Comment::find($report->reportable_id);
                if ($reportable) {
                    $title = substr($reportable->content, 0, 50) . '...';
                    $link = "/builds/{$reportable->build_id}#comment-{$reportable->id}";
                }
                break;
        }

        return [
            'type' => class_basename($report->reportable_type),
            'title' => $title,
            'link' => $link,
            'exists' => $reportable !== null,
        ];
    }
}
