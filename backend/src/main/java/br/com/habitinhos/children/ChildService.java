package br.com.habitinhos.children;

import br.com.habitinhos.auth.CurrentUser;
import br.com.habitinhos.auth.UserRole;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.children.dto.ChildResponse;
import br.com.habitinhos.shared.error.ForbiddenException;
import br.com.habitinhos.shared.error.NotFoundException;
import br.com.habitinhos.wallet.WalletService;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChildService {

  private static final Logger log = LoggerFactory.getLogger(ChildService.class);

  private final ChildProfileRepository childProfileRepository;
  private final WalletService walletService;
  private final PasswordEncoder passwordEncoder;

  public ChildService(
      ChildProfileRepository childProfileRepository,
      WalletService walletService,
      PasswordEncoder passwordEncoder) {
    this.childProfileRepository = childProfileRepository;
    this.walletService = walletService;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional
  public ChildResponse create(CurrentUser currentUser, ChildRequest request) {
    requireResponsible(currentUser);
    UUID familyUnitId = currentUser.familyUnitId();
    ChildProfile child = new ChildProfile(
        familyUnitId,
        request.name().trim(),
        request.age(),
        normalizeOptional(request.avatarKey()),
        hashOptionalPin(request.accessPin()));

    childProfileRepository.saveAndFlush(child);
    walletService.createForChild(familyUnitId, child.getId());
    log.info("Child created: familyUnitId={} childId={}", familyUnitId, child.getId());
    return toResponse(child);
  }

  @Transactional(readOnly = true)
  public List<ChildResponse> list(CurrentUser currentUser) {
    return list(currentUser, false);
  }

  @Transactional(readOnly = true)
  public List<ChildResponse> list(CurrentUser currentUser, boolean includeInactive) {
    requireResponsible(currentUser);
    var childrenQuery = includeInactive
        ? childProfileRepository.findAllByFamilyUnitIdOrderByCreatedAtAsc(currentUser.familyUnitId())
        : childProfileRepository.findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(currentUser.familyUnitId());
    List<ChildResponse> children = childrenQuery
        .stream()
        .map(this::toResponse)
        .toList();
    log.debug(
        "Children listed: familyUnitId={} includeInactive={} count={}",
        currentUser.familyUnitId(),
        includeInactive,
        children.size());
    return children;
  }

  @Transactional(readOnly = true)
  public ChildResponse get(CurrentUser currentUser, UUID id) {
    requireResponsible(currentUser);
    return childProfileRepository.findByIdAndFamilyUnitId(id, currentUser.familyUnitId())
        .map(this::toResponse)
        .orElseThrow(this::childNotFound);
  }

  @Transactional
  public ChildResponse update(CurrentUser currentUser, UUID id, ChildRequest request) {
    requireResponsible(currentUser);
    ChildProfile child = childProfileRepository
        .findByIdAndFamilyUnitIdAndActiveTrue(id, currentUser.familyUnitId())
        .orElseThrow(this::childNotFound);

    child.updateProfile(
        request.name().trim(),
        request.age(),
        normalizeOptional(request.avatarKey()));
    if (hasText(request.accessPin())) {
      child.updateAccessPinHash(passwordEncoder.encode(request.accessPin()));
    }
    log.info("Child updated: familyUnitId={} childId={}", currentUser.familyUnitId(), id);

    return toResponse(child);
  }

  @Transactional
  public ChildResponse deactivate(CurrentUser currentUser, UUID id) {
    requireResponsible(currentUser);
    ChildProfile child = childProfileRepository
        .findByIdAndFamilyUnitIdAndActiveTrue(id, currentUser.familyUnitId())
        .orElseThrow(this::childNotFound);
    child.deactivate();
    log.info("Child deactivated: familyUnitId={} childId={}", currentUser.familyUnitId(), id);
    return toResponse(child);
  }

  private void requireResponsible(CurrentUser currentUser) {
    if (currentUser.role() != UserRole.RESPONSIBLE) {
      log.warn("Access denied: non-responsible role={} familyUnitId={}", currentUser.role(), currentUser.familyUnitId());
      throw new ForbiddenException("RESPONSIBLE_REQUIRED", "Apenas responsáveis podem realizar esta ação.");
    }
  }

  private ChildResponse toResponse(ChildProfile child) {
    return new ChildResponse(
        child.getId(),
        child.getName(),
        child.getAge(),
        child.getAvatarKey(),
        child.isActive(),
        child.getCreatedAt(),
        child.getUpdatedAt());
  }

  private String hashOptionalPin(String accessPin) {
    return hasText(accessPin) ? passwordEncoder.encode(accessPin) : null;
  }

  private String normalizeOptional(String value) {
    return hasText(value) ? value.trim() : null;
  }

  private boolean hasText(String value) {
    return value != null && !value.trim().isEmpty();
  }

  private NotFoundException childNotFound() {
    return new NotFoundException("CHILD_NOT_FOUND", "Criança não encontrada.");
  }
}
