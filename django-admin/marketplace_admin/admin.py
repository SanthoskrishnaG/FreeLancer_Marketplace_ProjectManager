from django.contrib import admin
from django.utils.html import format_html
from .models import (
    User, ClientProfile, FreelancerProfile, Category, Skill,
    Project, Milestone, Proposal, Contract, Dispute,
    Invoice, Payment, Review, AuditLog
)

@admin.action(description="Verify selected Freelancers")
def verify_freelancers(modeladmin, request, queryset):
    queryset.update(is_verified=True)

@admin.action(description="Revoke verification for selected Freelancers")
def revoke_verification(modeladmin, request, queryset):
    queryset.update(is_verified=False)

@admin.action(description="Activate selected Users")
def activate_users(modeladmin, request, queryset):
    queryset.update(status='ACTIVE')

@admin.action(description="Suspend selected Users")
def suspend_users(modeladmin, request, queryset):
    queryset.update(status='SUSPENDED')

@admin.action(description="Resolve disputes (Release Escrow to Freelancer)")
def resolve_disputes_release(modeladmin, request, queryset):
    queryset.update(status='RESOLVED', resolution='RELEASE_PAYMENT')

@admin.action(description="Resolve disputes (Refund to Client)")
def resolve_disputes_refund(modeladmin, request, queryset):
    queryset.update(status='RESOLVED', resolution='CANCEL_CONTRACT')


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role_badge', 'status_badge', 'created_at')
    list_filter = ('role', 'status', 'created_at')
    search_fields = ('name', 'email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    actions = [activate_users, suspend_users]

    def role_badge(self, obj):
        colors = {'ADMIN': '#f43f5e', 'CLIENT': '#38bdf8', 'FREELANCER': '#818cf8'}
        color = colors.get(obj.role, '#9ca3af')
        return format_html('<span style="background:{}; color:#fff; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:11px;">{}</span>', color, obj.role)
    role_badge.short_description = 'Role'

    def status_badge(self, obj):
        color = '#10b981' if obj.status == 'ACTIVE' else '#f43f5e'
        return format_html('<span style="color:{}; font-weight:bold;">{}</span>', color, obj.status)
    status_badge.short_description = 'Status'


@admin.register(FreelancerProfile)
class FreelancerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'hourly_rate', 'rating', 'total_earned', 'is_verified')
    list_filter = ('is_verified', 'rating')
    search_fields = ('user__name', 'user__email', 'title')
    actions = [verify_freelancers, revoke_verification]


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'total_spent', 'created_at')
    search_fields = ('user__name', 'company_name')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'category', 'budget', 'status', 'experience_level', 'created_at')
    list_filter = ('status', 'category', 'experience_level', 'created_at')
    search_fields = ('title', 'client__name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'amount', 'order', 'status')
    list_filter = ('status',)
    search_fields = ('title', 'project__title')


@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ('project', 'freelancer', 'bid_amount', 'estimated_duration_days', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('project__title', 'freelancer__name')


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'freelancer', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'client__name', 'freelancer__name')


@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = ('contract', 'opened_by', 'reason', 'status', 'resolution', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('contract__title', 'opened_by__name', 'reason')
    actions = [resolve_disputes_release, resolve_disputes_refund]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'client', 'freelancer', 'total', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('invoice_number', 'client__name', 'freelancer__name')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'fee', 'currency', 'provider', 'status', 'created_at')
    list_filter = ('status', 'provider', 'currency')
    search_fields = ('user__name', 'user__email')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('contract', 'reviewer', 'target_user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('reviewer__name', 'target_user__name')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'entity', 'entity_id', 'user', 'ip_address', 'created_at')
    list_filter = ('action', 'entity', 'created_at')
    search_fields = ('action', 'entity', 'user__name', 'details')
    readonly_fields = ('id', 'action', 'entity', 'entity_id', 'user', 'details', 'ip_address', 'created_at')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
